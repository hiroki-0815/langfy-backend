flowchart TD
%% Posts API Endpoints
subgraph Posts_API [Posts API]
A1[GET /posts<br/><em>Retrieve all posts (with optional pagination/filtering)</em>]
A2[GET /posts/:postId<br/><em>Retrieve a single post by its ID</em>]
A3[POST /posts<br/><em>Create a new post ("feeling" or content)</em>]
A4[POST /posts/:postId/like<br/><em>Like a post (add user ID to likes)</em>]
A5[POST /posts/:postId/unlike<br/><em>Unlike a post (remove user ID from likes)</em>]
A6[DELETE /posts/:postId<br/><em>Delete a post (by owner or admin)</em>]
end

    %% Comments API Endpoints
    subgraph Comments_API [Comments API]
      B1[GET /posts/:postId/comments<br/><em>Retrieve all comments for a given post</em>]
      B2[POST /posts/:postId/comments<br/><em>Create a comment on a post</em>]
      B3[PUT /comments/:commentId<br/><em>Update a comment (by author)</em>]
      B4[DELETE /comments/:commentId<br/><em>Delete a comment (by author or admin)</em>]
    end
