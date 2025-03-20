mindmap
root((Post Handler))
Get_All_Posts
Path: "[GET] /posts"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Response: - "200: Array of posts" - "400: Error message"
Get_Single_Post
Path: "[GET] /posts/:postId"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Params: - postId: "string (ID of the post)"
Response: - "200: Post object" - "404: Post not found"
Create_Post
Path: "[POST] /posts"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Body: - content: "string (post content)"
Response: - "201: Created post object" - "400: Error message"
Like_Post
Path: "[POST] /posts/:postId/like"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Params: - postId: "string (ID of the post)"
Note: "userId typically derived from token"
Response: - "200: Updated post object" - "400: Post not found or already liked"
Unlike_Post
Path: "[POST] /posts/:postId/unlike"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Params: - postId: "string (ID of the post)"
Note: "userId typically derived from token"
Response: - "200: Updated post object" - "400: Post not found or user hasn't liked it"
Delete_Post
Path: "[DELETE] /posts/:postId"
Headers: - Content-Type: "application/json" - Accept-Language: "en" - Authorization: "Bearer {access_token}"
Params: - postId: "string (ID of the post)"
Response: - "200: Post deleted successfully" - "403: Forbidden (not owner or admin)" - "404: Post not found"
