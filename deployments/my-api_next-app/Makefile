.PHONY: pull down up deploy

pull:
	@echo "Pulling the latest images..."
	docker-compose pull

down:
	@echo "Stopping and removing existing containers..."
	docker-compose down

up:
	@echo "Starting the containers..."
	docker-compose up -d

deploy: down pull up
	@echo "Deployment complete."