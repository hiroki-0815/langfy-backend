# Post Handler

APIs related to user-generated posts and interactions.

## Get All Posts API

Path: `[GET] /posts`

### Request

#### Headers

| Key             | Description                                                   |
| --------------- | ------------------------------------------------------------- |
| Content-Type    | Should be `application/json`                                  |
| Accept-Language | Language for response messages. ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`                                       |

### Response

#### OK Response

Response Code: 200

Body:

```json
[
  {
    "id": "string",
    "content": "string",
    "authorId": "string",
    "likesCount": number,
    "createdAt": "timestamp"
  }
]
```

#### Error Response

Response Code: 400

Body:

```json
{
  "error": "Error message"
}
```

## Get Single Post API

Path: `[GET] /posts/:postId`

### Request

#### Headers

| Key             | Description                   |
| --------------- | ----------------------------- |
| Content-Type    | `application/json`            |
| Accept-Language | ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`       |

#### Params

| Key    | Type   | Description    |
| ------ | ------ | -------------- |
| postId | string | ID of the post |

### Response

#### OK Response

Response Code: 200

Body:

```json
{
  "id": "string",
  "content": "string",
  "authorId": "string",
  "likesCount": number,
  "createdAt": "timestamp"
}
```

#### Error Response

Response Code: 404

Body:

```json
{
  "error": "Post not found"
}
```

## Create Post API

Path: `[POST] /posts`

### Request

#### Headers

| Key             | Description                   |
| --------------- | ----------------------------- |
| Content-Type    | `application/json`            |
| Accept-Language | ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`       |

#### Body

| Key     | Type   | Description         |
| ------- | ------ | ------------------- |
| content | string | Content of the post |

### Response

#### Created Response

Response Code: 201

Body:

```json
{
  "id": "string",
  "content": "string",
  "authorId": "string",
  "likesCount": number,
  "createdAt": "timestamp"
}
```

#### Error Response

Response Code: 400

Body:

```json
{
  "error": "Error message"
}
```

## Like Post API

Path: `[POST] /posts/:postId/like`

### Request

#### Headers

| Key             | Description                   |
| --------------- | ----------------------------- |
| Content-Type    | `application/json`            |
| Accept-Language | ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`       |

#### Params

| Key    | Type   | Description    |
| ------ | ------ | -------------- |
| postId | string | ID of the post |

### Response

#### OK Response

Response Code: 200

Body:

```json
{
  "id": "string",
  "content": "string",
  "authorId": "string",
  "likesCount": number,
  "createdAt": "timestamp"
}
```

#### Error Response

Response Code: 400

Body:

```json
{
  "error": "Post not found or already liked"
}
```

## Unlike Post API

Path: `[POST] /posts/:postId/unlike`

### Request

#### Headers

| Key             | Description                   |
| --------------- | ----------------------------- |
| Content-Type    | `application/json`            |
| Accept-Language | ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`       |

#### Params

| Key    | Type   | Description    |
| ------ | ------ | -------------- |
| postId | string | ID of the post |

### Response

#### OK Response

Response Code: 200

Body:

```json
{
  "id": "string",
  "content": "string",
  "authorId": "string",
  "likesCount": number,
  "createdAt": "timestamp"
}
```

#### Error Response

Response Code: 400

Body:

```json
{
  "error": "Post not found or user hasn't liked it"
}
```

## Delete Post API

Path: `[DELETE] /posts/:postId`

### Request

#### Headers

| Key             | Description                   |
| --------------- | ----------------------------- |
| Content-Type    | `application/json`            |
| Accept-Language | ISO 639-1 codes. Default `en` |
| Authorization   | `Bearer {access_token}`       |

#### Params

| Key    | Type   | Description    |
| ------ | ------ | -------------- |
| postId | string | ID of the post |

### Response

#### OK Response

Response Code: 200

Body:

```json
{
  "message": "Post deleted successfully"
}
```

#### Error Response

Response Codes:

- 403 Forbidden (not owner or admin)
- 404 Post not found

Body:

```json
{
  "error": "Forbidden or Post not found"
}
```
