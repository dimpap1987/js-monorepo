for dev certs

sudo openssl req -x509 -nodes -days 365 \
 -newkey rsa:2048 \
 -keyout /etc/ssl/myapp/key.pem \
 -out /etc/ssl/myapp/fullchain.pem \
 -subj "/C=GR/ST=Nowhere/L=Local/O=Dev/CN=ubuntu-vm"

for production certs use letsencrypt
