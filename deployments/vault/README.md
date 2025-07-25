# STEPS do setup vault

- first create credentials - secret_id and role_id

# Go insinde the container vault and ....

export VAULT_TOKEN=

# create a policy with name  my-api_policy

path "secret/data/my-api/*" {
  capabilities = ["read", "list"]
}


vault auth enable approle


vault write auth/approle/role/my-api_role \
    token_policies="my-api_policy" \
    token_ttl=720h \
    token_max_ttl=720h \
    secret_id_ttl=720h


vault read -format=table auth/approle/role/my-api_role/role-id | grep role_id


vault write -f -format=table auth/approle/role/my-api_role/secret-id


vault secrets enable -path=secret -version=2 kv


vault kv put secret/data/my-api/env \
    VAPID_PUBLIC_KEY="" \
    VAPID_PRIVATE_KEY="" \
    GOOGLE_CLIENT_ID="" \
    GOOGLE_CLIENT_SECRET="" \
    ACCESS_TOKEN_SECRET=""
