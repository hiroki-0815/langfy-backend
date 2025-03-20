flowchart TD
subgraph Posts
A1[GET /posts<br/><em>Retrieve all posts</em>]
A2[GET /posts/:postId<br/><em>Retrieve a single post</em>]
A3[POST /posts<br/><em>Create a new post</em>]
A4[POST /posts/:postId/like<br/><em>Like a post</em>]
A5[POST /posts/:postId/unlike<br/><em>Unlike a post</em>]
A6[DELETE /posts/:postId<br/><em>Delete a post</em>]
end

    subgraph Comments
      B1[GET /posts/:postId/comments<br/><em>Retrieve comments for a post</em>]
      B2[POST /posts/:postId/comments<br/><em>Create a comment</em>]
      B3[PUT /comments/:commentId<br/><em>Update a comment</em>]
      B4[DELETE /comments/:commentId<br/><em>Delete a comment</em>]
    end
