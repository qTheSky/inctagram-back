
window.onload = function() {
  // Build a system
  let url = window.location.search.match(/url=([^&]+)/);
  if (url && url.length > 1) {
    url = decodeURIComponent(url[1]);
  } else {
    url = window.location.origin;
  }
  let options = {
  "swaggerDoc": {
    "openapi": "3.0.0",
    "paths": {
      "/auth/registration": {
        "post": {
          "operationId": "AuthController_registration",
          "summary": "Registration in the system. Email with confirmation code will be send to passed email address.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/RegisterDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted. Email with confirmation code will be send to passed email address"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/login": {
        "post": {
          "operationId": "AuthController_localLogin",
          "summary": "Try login user to the system",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Example request body",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/LoginDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the password or login is wrong"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/confirm-email": {
        "post": {
          "operationId": "AuthController_confirmUserEmail",
          "summary": "Confirm registration.",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailConfirmDto"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Email was verified. Account was activated"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/refresh-token": {
        "post": {
          "operationId": "AuthController_refreshToken",
          "summary": "Generate new pair of access and refresh tokens (in cookie client must send correct refreshToken that will be revoked after refreshing). ",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 8 hours) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30days).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/logout": {
        "post": {
          "operationId": "AuthController_logout",
          "summary": "In cookie client must send correct refreshToken that will be revoked",
          "parameters": [],
          "responses": {
            "204": {
              "description": ""
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/me": {
        "get": {
          "operationId": "AuthController_getAuthUserData",
          "summary": "Get information about current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/AuthMeDto"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Auth"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/auth/registration-email-resending": {
        "post": {
          "operationId": "AuthController_resendEmailConfirmationCode",
          "summary": "Resend confirmation registration Email if user exists",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/EmailResendModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Input data is accepted.Email with confirmation code will be send to passed email address.Confirmation code should be inside link as query param, for example: https://some-front.com/confirm-registration?code=youtcodehere"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/password-recovery": {
        "post": {
          "operationId": "AuthController_sendPasswordRecoveryCode",
          "summary": "Password recovery via Email confirmation. Email should be sent with RecoveryCode inside",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/PasswordRecoveryModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "Even if current email is not registered (for prevent user's email detection)"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/new-password": {
        "post": {
          "operationId": "AuthController_updateUserPassword",
          "summary": "Confirm password recovery",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePasswordModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "If code is valid and new password is accepted"
            },
            "403": {
              "description": "If code is wrong"
            },
            "404": {
              "description": "If user with this code doesnt exist"
            },
            "429": {
              "description": "More than 5 attempts from one IP-address during 10 seconds"
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/google": {
        "get": {
          "operationId": "AuthController_googleAuth",
          "summary": "Try login user to the system via google",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/auth/github": {
        "get": {
          "operationId": "AuthController_githubAuth",
          "summary": "Try login user to the system via github",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Returns JWT accessToken (expired after 10 minutes) in body and JWT refreshToken in cookie (http-only, secure) (expired after 30 days).",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "accessToken": "string"
                    }
                  }
                }
              }
            }
          },
          "tags": [
            "Auth"
          ]
        }
      },
      "/security/devices": {
        "get": {
          "operationId": "SessionsController_getSessionsOfUser",
          "summary": "Returns all devices with active sessions for current user",
          "parameters": [],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": [
                      {
                        "ip": "string",
                        "title": "string",
                        "lastActiveDate": "string",
                        "deviceId": "string"
                      }
                    ]
                  }
                }
              }
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        },
        "delete": {
          "operationId": "SessionsController_deleteSessionExceptCurrent",
          "summary": "Terminate all other (exclude current) device's sessions",
          "parameters": [],
          "responses": {
            "204": {
              "description": "No content"
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        }
      },
      "/security/devices/{deviceId}": {
        "delete": {
          "operationId": "SessionsController_deleteSessionByDeviceId",
          "summary": "Terminate specified device session",
          "parameters": [
            {
              "name": "deviceId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No Content"
            },
            "401": {
              "description": "If the JWT refreshToken inside cookie is missing, expired or incorrect"
            },
            "403": {
              "description": "If try to delete the deviceId of other user"
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "SecurityDevices"
          ]
        }
      },
      "/users/profile": {
        "put": {
          "operationId": "UsersController_updateUserProfile",
          "summary": "Update current user profile",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Example request body",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UserProfileDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns updated profile",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserProfileViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/users/{userId}/profile": {
        "get": {
          "operationId": "UsersController_getUserProfile",
          "summary": "Get user profile by id of user",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns user profile",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserProfileViewModel"
                  }
                }
              }
            },
            "404": {
              "description": "Not found"
            }
          },
          "tags": [
            "Users"
          ]
        }
      },
      "/users/avatar": {
        "post": {
          "operationId": "UsersController_uploadMainBlogImage",
          "summary": "Upload user avatar (1mb)",
          "parameters": [],
          "requestBody": {
            "required": true,
            "content": {
              "multipart/form-data": {
                "schema": {
                  "type": "object",
                  "properties": {
                    "file": {
                      "type": "string",
                      "format": "binary"
                    }
                  }
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns user profile",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/UserProfileViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/users/{userId}/subscribe": {
        "patch": {
          "operationId": "UsersController_subscribeToUser",
          "summary": "Subscribe to user or unsubscribe",
          "parameters": [
            {
              "name": "userId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "true if subscribed. false if unsubscribed",
              "content": {
                "application/json": {
                  "schema": {
                    "type": "boolean"
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts": {
        "post": {
          "operationId": "PostsController_createPost",
          "summary": "create post",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Example request body",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreatePostDto"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "Returns created post",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/posts/{postId}": {
        "put": {
          "operationId": "PostsController_updatePost",
          "summary": "update post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "description": "Example request body",
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdatePostDto"
                }
              }
            }
          },
          "responses": {
            "200": {
              "description": "Returns updated post",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": ""
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "PostsController_deletePost",
          "summary": "delete post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": ""
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "PostsController_getPost",
          "summary": "get post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "get post by id",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Posts"
          ]
        }
      },
      "/posts/{postId}/comments": {
        "get": {
          "operationId": "PostsController_findCommentsOfPost",
          "summary": "Returns comments for specified post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            },
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Success",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "pagesCount": 0,
                      "page": 0,
                      "pageSize": 0,
                      "totalCount": 0,
                      "items": [
                        {
                          "id": "string",
                          "content": "string",
                          "commentatorInfo": {
                            "userId": "string",
                            "userLogin": "string"
                          },
                          "createdAt": "2023-03-13T12:42:19.885Z"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "404": {
              "description": "If post for passed postId doesn't exist"
            }
          },
          "tags": [
            "Posts"
          ]
        },
        "post": {
          "operationId": "PostsController_createComment",
          "summary": "Create new comment",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/CreateCommentModel"
                }
              }
            }
          },
          "responses": {
            "201": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "content": "string",
                      "commentatorInfo": {
                        "userId": "string",
                        "userLogin": "string"
                      },
                      "createdAt": "2023-03-13T12:42:19.885Z"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "404": {
              "description": "If post with specified id doesn't exists"
            }
          },
          "tags": [
            "Posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/users-posts/{postId}": {
        "post": {
          "operationId": "UsersPostsController_addFavoritePost",
          "summary": "add favorite post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns added post",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users-posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "UsersPostsController_getFavoritePost",
          "summary": "get favorite post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns user favorite post by id",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users-posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "UsersPostsController_deleteFavoritePost",
          "summary": "delete favorite post",
          "parameters": [
            {
              "name": "postId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "delete user post by id",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users-posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/users-posts": {
        "get": {
          "operationId": "UsersPostsController_getAllFavoritePosts",
          "summary": "get all favorite posts",
          "parameters": [
            {
              "name": "pageNumber",
              "required": false,
              "in": "query",
              "schema": {
                "default": 1,
                "type": "number"
              }
            },
            {
              "name": "pageSize",
              "required": false,
              "in": "query",
              "schema": {
                "default": 10,
                "type": "number"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "Returns all user posts",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users-posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "UsersPostsController_deleteAllFavoritePosts",
          "summary": "delete favorite posts",
          "parameters": [],
          "responses": {
            "204": {
              "description": "delete all user posts",
              "content": {
                "application/json": {
                  "schema": {
                    "$ref": "#/components/schemas/PostViewModel"
                  }
                }
              }
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            }
          },
          "tags": [
            "Users-posts"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        }
      },
      "/comments/{commentId}": {
        "put": {
          "operationId": "CommentsController_updateComment",
          "summary": "Update existing comment by id with InputModel",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "requestBody": {
            "required": true,
            "content": {
              "application/json": {
                "schema": {
                  "$ref": "#/components/schemas/UpdateCommentModel"
                }
              }
            }
          },
          "responses": {
            "204": {
              "description": "No content"
            },
            "400": {
              "description": "If the inputModel has incorrect values",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "errorsMessages": [
                        {
                          "message": "string",
                          "field": "string"
                        }
                      ]
                    }
                  }
                }
              }
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If try edit the comment that is not your own"
            },
            "404": {
              "description": "If comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "delete": {
          "operationId": "CommentsController_deleteComment",
          "summary": "Delete specified comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "204": {
              "description": "No content"
            },
            "401": {
              "description": "Unauthorized"
            },
            "403": {
              "description": "If try delete the comment that is not your own"
            },
            "404": {
              "description": "If comment not found"
            }
          },
          "tags": [
            "Comments"
          ],
          "security": [
            {
              "bearer": []
            }
          ]
        },
        "get": {
          "operationId": "CommentsController_getCommentById",
          "summary": "Return comment by id",
          "parameters": [
            {
              "name": "commentId",
              "required": true,
              "in": "path",
              "schema": {
                "type": "string"
              }
            }
          ],
          "responses": {
            "200": {
              "description": "",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "id": "string",
                      "content": "string",
                      "commentatorInfo": {
                        "userId": "string",
                        "userLogin": "string"
                      },
                      "createdAt": "2023-03-13T12:42:19.885Z"
                    }
                  }
                }
              }
            },
            "404": {
              "description": "Not Found"
            }
          },
          "tags": [
            "Comments"
          ]
        }
      }
    },
    "info": {
      "title": "INCTAGRAM API",
      "description": "here will be some description",
      "version": "1.0",
      "contact": {}
    },
    "tags": [],
    "servers": [],
    "components": {
      "schemas": {
        "RegisterDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            },
            "login": {
              "type": "string",
              "description": "User login",
              "example": "John",
              "minLength": 3,
              "maxLength": 10
            },
            "password": {
              "type": "string",
              "description": "User password",
              "example": "string",
              "minLength": 6,
              "maxLength": 20
            },
            "frontendLink": {
              "type": "string",
              "description": "Link for email. this link will be send to user email",
              "example": "http://localhost:8000/auth/email-verification"
            }
          },
          "required": [
            "email",
            "login",
            "password",
            "frontendLink"
          ]
        },
        "LoginDto": {
          "type": "object",
          "properties": {
            "loginOrEmail": {
              "type": "string"
            },
            "password": {
              "type": "string"
            }
          },
          "required": [
            "loginOrEmail",
            "password"
          ]
        },
        "EmailConfirmDto": {
          "type": "object",
          "properties": {
            "code": {
              "type": "string",
              "description": "Confirmation code",
              "example": "someUUIDdsajkdsa-dsad-as-das-ddsa",
              "format": "email"
            }
          },
          "required": [
            "code"
          ]
        },
        "AuthMeDto": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string"
            },
            "login": {
              "type": "string"
            },
            "userId": {
              "type": "string"
            }
          },
          "required": [
            "email",
            "login",
            "userId"
          ]
        },
        "EmailResendModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            },
            "frontendLink": {
              "type": "string",
              "description": "Link for email. this link will be send to user email",
              "example": "http://localhost:8000/auth/email-verification"
            }
          },
          "required": [
            "email",
            "frontendLink"
          ]
        },
        "PasswordRecoveryModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            },
            "frontendLink": {
              "type": "string",
              "description": "Link for email. this link will be send to user email",
              "example": "http://localhost:8000/auth/email-verification"
            }
          },
          "required": [
            "email",
            "frontendLink"
          ]
        },
        "UpdatePasswordModel": {
          "type": "object",
          "properties": {
            "recoveryCode": {
              "type": "string",
              "description": "Recovery code",
              "example": "uuid-from-email-message"
            },
            "newPassword": {
              "type": "string",
              "description": "New Password",
              "example": "newpassword123",
              "minLength": 6,
              "maxLength": 20
            }
          },
          "required": [
            "recoveryCode",
            "newPassword"
          ]
        },
        "UserProfileDto": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string",
              "description": "User display name.",
              "example": "string"
            },
            "name": {
              "type": "string",
              "description": "user name",
              "example": "string"
            },
            "surName": {
              "type": "string",
              "description": "user surname",
              "example": "string"
            },
            "dateOfBirthday": {
              "type": "string",
              "description": "date of birthday user",
              "example": "some date"
            },
            "city": {
              "type": "string",
              "description": "city of user",
              "example": "string"
            },
            "aboutMe": {
              "type": "string",
              "description": "information about user",
              "example": "string"
            }
          }
        },
        "UserProfileViewModel": {
          "type": "object",
          "properties": {
            "userName": {
              "type": "string",
              "example": "string"
            },
            "name": {
              "type": "string",
              "example": "string"
            },
            "surName": {
              "type": "string",
              "example": "string"
            },
            "dateOfBirthday": {
              "type": "string",
              "example": "2023-04-10T16:20:10.847Z"
            },
            "city": {
              "type": "string",
              "example": "string"
            },
            "aboutMe": {
              "type": "string",
              "example": "string"
            },
            "avatarUrl": {
              "type": "string",
              "example": "string"
            }
          },
          "required": [
            "userName",
            "name",
            "surName",
            "dateOfBirthday",
            "city",
            "aboutMe",
            "avatarUrl"
          ]
        },
        "CreatePostDto": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "description",
              "example": "some post description"
            },
            "files": {
              "description": "FILE!!",
              "example": "MULTIPART FORM DATA",
              "type": "array",
              "items": {
                "type": "string",
                "format": "binary"
              }
            }
          },
          "required": [
            "description",
            "files"
          ]
        },
        "PostViewModel": {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "description": "id",
              "example": "3123213123"
            },
            "photos": {
              "type": "string[]",
              "description": "photos url",
              "example": "[https://url.com/photo1.jpg, https://url.com/photo1.jpg]",
              "format": "url"
            },
            "description": {
              "type": "string",
              "description": "post description",
              "example": "frontend noobs"
            },
            "createdAt": {
              "type": "string",
              "description": "date when post was created",
              "example": "2023-04-10T16:20:10.847Z"
            },
            "updatedAt": {
              "type": "string",
              "description": "date when post was created",
              "example": "2023-04-10T16:20:10.847Z"
            }
          },
          "required": [
            "id",
            "photos",
            "description",
            "createdAt",
            "updatedAt"
          ]
        },
        "UpdatePostDto": {
          "type": "object",
          "properties": {
            "description": {
              "type": "string",
              "description": "post description",
              "example": "frontend noobs"
            }
          },
          "required": [
            "description"
          ]
        },
        "CreateCommentModel": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "minLength": 20,
              "maxLength": 300
            }
          },
          "required": [
            "content"
          ]
        },
        "UpdateCommentModel": {
          "type": "object",
          "properties": {
            "content": {
              "type": "string",
              "description": "Data for updating",
              "minLength": 20,
              "maxLength": 300
            }
          },
          "required": [
            "content"
          ]
        }
      }
    }
  },
  "customOptions": {}
};
  url = options.swaggerUrl || url
  let urls = options.swaggerUrls
  let customOptions = options.customOptions
  let spec1 = options.swaggerDoc
  let swaggerOptions = {
    spec: spec1,
    url: url,
    urls: urls,
    dom_id: '#swagger-ui',
    deepLinking: true,
    presets: [
      SwaggerUIBundle.presets.apis,
      SwaggerUIStandalonePreset
    ],
    plugins: [
      SwaggerUIBundle.plugins.DownloadUrl
    ],
    layout: "StandaloneLayout"
  }
  for (let attrname in customOptions) {
    swaggerOptions[attrname] = customOptions[attrname];
  }
  let ui = SwaggerUIBundle(swaggerOptions)

  if (customOptions.initOAuth) {
    ui.initOAuth(customOptions.initOAuth)
  }

  if (customOptions.authAction) {
    ui.authActions.authorize(customOptions.authAction)
  }
  
  window.ui = ui
}
