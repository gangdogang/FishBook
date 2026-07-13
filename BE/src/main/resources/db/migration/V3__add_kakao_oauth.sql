ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

CREATE TABLE user_oauth_account (
    id               BIGSERIAL PRIMARY KEY,
    provider         VARCHAR(20) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    user_id          BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT uk_user_oauth_provider_user UNIQUE (provider, provider_user_id),
    CONSTRAINT uk_user_oauth_provider_owner UNIQUE (provider, user_id)
);

CREATE INDEX idx_user_oauth_account_user ON user_oauth_account(user_id);
