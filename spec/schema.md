# DB Schema Spec

```mermaid
erDiagram
    USER {
        ObjectId PK "auto generated"
        auth0Id String "non-null, unique"
        name String "non-null"
        email String "non-null, unique"
        gender String "enum(GENDERS)"
        city String
        country String
        originCountry String "enum(ORIGIN_COUNTRIES)"
        nativeLanguage String "enum(LANGUAGES)"
        age Number
        learningLanguage String "enum(LANGUAGES)"
        fluencyLevel String "enum(FLUENCY_LEVELS)"
        motivation String "enum(MOTIVATIONS)"
        selfIntroduction String
        imageUrl String
        createdAt DATETIME "non-null"
        updatedAt DATETIME "non-null"
    }

    POST {
        ObjectId PK "auto generated"
        userId ObjectId "non-null, references USER(_id)"
        content text "non-null"
        likes [ObjectId] "array of references USER(_id)"
        createdAt DATETIME "non-null"
        updatedAt DATETIME "non-null"
    }

    COMMENT {
        ObjectId PK "auto generated"
        userId ObjectId "non-null, references USER(_id)"
        postId ObjectId "non-null, references POST(_id)"
        text text "non-null"
        createdAt DATETIME "non-null"
        updatedAt DATETIME "non-null"
    }

    USER ||--|{ POST : "creates"
    USER ||--|{ COMMENT : "writes"
    POST ||--|{ COMMENT : "has"
```
