# Use an official Node runtime as a parent image
FROM node:16-alpine

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install any needed packages specified in package.json
RUN yarn

# Bundle app source inside the Docker image
# by copying everything from the current directory
# to the present working directory inside the container
COPY . .

# Make port 5000 available to the outside
EXPOSE 5000

# Define the command to run the application
CMD [ "yarn", "start" ]
