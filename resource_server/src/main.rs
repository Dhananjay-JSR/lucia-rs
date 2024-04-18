use std::{env, sync::Arc};

use axum::{
    extract::{Request, State},
    http::{HeaderMap, StatusCode},
    middleware::{self, Next},
    response::Response,
    routing::get,
    Extension, Router,
};

use chrono::{DateTime, Duration, Utc};
use dotenvy::dotenv;
use entity::{session, user};
use sea_orm::{ActiveModelTrait, Database, DatabaseConnection, EntityTrait};
use tower_http::cors::{self, CorsLayer};
mod entity;

#[derive(Clone)]
struct RouterState {
    db: DatabaseConnection,
}

#[tokio::main]
async fn main() {
    dotenv().expect(".env file not found");
    let db_conn_string = env::var("DATABASE_CONNECTION").unwrap();
    let db_conn = Database::connect(db_conn_string).await.unwrap();
    let state = RouterState { db: db_conn };
    let app: Router = Router::new()
        .route("/", get(root))
        .route_layer(middleware::from_fn_with_state(
            state.clone(),
            ValidateRequest,
        ))
        .route_layer(CorsLayer::permissive())
        .with_state(state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:5600").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn root(Extension(LoggedUser): Extension<user::Model>) -> String {
    format!("Welcome {}", LoggedUser.user_name)
}

async fn ValidateRequest(
    State(state): State<RouterState>,
    headers: HeaderMap,
    mut request: Request,
    next: Next,
) -> Result<Response, StatusCode> {
    let authorisation_header = headers.get("Authorization");
    match authorisation_header {
        None => Err(StatusCode::UNAUTHORIZED),
        Some(headerValue) => {
            let session_id = headerValue
                .to_str()
                .unwrap()
                .split("Bearer ")
                .collect::<Vec<_>>()[1];
            let session_querry = session::Entity::find_by_id(session_id)
                .find_also_related(user::Entity)
                .one(&state.db)
                .await
                .unwrap();
            match session_querry {
                Some((session, user_model)) => {
                    match user_model {
                        // if No User is Associated with Session -> Maybe Also Delete it
                        None => Err(StatusCode::UNAUTHORIZED),
                        Some(user) => {
                            // Get Current Server Time
                            let current_time = Utc::now();
                            // Get Expire Time
                            let expired_date: DateTime<Utc> = session.expires_at.into();
                            // Check if Session has Expired
                            if current_time >= expired_date {
                                // Session Has Expired
                                Err(StatusCode::UNAUTHORIZED)
                            } else {
                                // Calculate the Expected Date of Expiration
                                let day_prediction = Utc::now() + Duration::try_days(15).unwrap();
                                // Check if we have Less Than 15 Days Remaining
                                if (day_prediction > expired_date && expired_date > current_time) {
                                    // Less Then 15 Days Remaining then Extend it By 30 Days
                                    let new_expire_time =
                                        session.expires_at + Duration::try_days(30).unwrap();
                                    let mut session_update: session::ActiveModel = session.into();
                                    session_update.expires_at = sea_orm::Set(new_expire_time);
                                    let session: session::Model =
                                        session_update.update(&state.db).await.unwrap();
                                    request.extensions_mut().insert(user);
                                    let response = next.run(request).await;
                                    Ok(response)
                                } else {
                                    //   We Have Time in Session Expiration
                                    request.extensions_mut().insert(user);
                                    let response = next.run(request).await;
                                    Ok(response)
                                }
                            }
                        }
                    }
                }
                None => Err(StatusCode::UNAUTHORIZED),
            }
        }
    }
}
