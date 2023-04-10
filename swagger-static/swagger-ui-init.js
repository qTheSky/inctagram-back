
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
          "operationId": "AuthController_login",
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
              "description": "No content"
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
                    "example": {
                      "email": "string",
                      "userName": "string",
                      "userId": "string"
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
              "description": "If the inputModel has invalid email (for example 222^gmail.com)"
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
      "/users/profile": {
        "put": {
          "operationId": "UsersController_updateUserProfile",
          "summary": "Update current user profile",
          "parameters": [],
          "requestBody": {
            "required": true,
            "description": "Example request body (all fields not required)",
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
                    "example": {
                      "userName": "string",
                      "name": "string",
                      "surName": "string",
                      "aboutMe": "string",
                      "city": "string",
                      "dateOfBirthday": "2023-04-10T16:20:10.847Z",
                      "avatarUrl": "https://avavar.com"
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
                    "example": {
                      "userName": "string",
                      "name": "string",
                      "surName": "string",
                      "aboutMe": "string",
                      "city": "string",
                      "dateOfBirthday": "2023-04-10T16:20:10.847Z",
                      "avatarUrl": "https://avavar.com"
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
            "201": {
              "description": "Uploaded image information object",
              "content": {
                "application/json": {
                  "schema": {
                    "example": {
                      "userName": "string",
                      "name": "string",
                      "surName": "string",
                      "aboutMe": "string",
                      "city": "string",
                      "dateOfBirthday": "2023-04-10T16:20:10.847Z",
                      "avatarUrl": "https://avavar.com"
                    }
                  }
                }
              }
            },
            "400": {
              "description": "If file format is incorrect",
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
            }
          },
          "required": [
            "email",
            "login",
            "password"
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
        "EmailResendModel": {
          "type": "object",
          "properties": {
            "email": {
              "type": "string",
              "description": "User email",
              "example": "user@example.com",
              "format": "email"
            }
          },
          "required": [
            "email"
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
            }
          },
          "required": [
            "email"
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
