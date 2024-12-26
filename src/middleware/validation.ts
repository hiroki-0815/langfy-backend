import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { NATIONALITIES, LANGUAGES } from "../model/enums/enum";

const handleValidationErrors = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"),
  body("gender").isString().isIn(["male", "female"]).withMessage("Gender must be 'male' or 'female'"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  body("nationality").isString().isIn(NATIONALITIES).withMessage("Invalid nationality"),
  body("nativeLanguage").isString().isIn(LANGUAGES).withMessage("Invalid native language"),
  body("age")
    .trim()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Age must be a positive integer"),
  body("learningLanguage").isString().isIn(LANGUAGES).withMessage("Invalid learning language"),
  body("fluencyLevel")
    .isString()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Fluency level must be 'beginner', 'intermediate', or 'advanced'"),
  body("motivation")
    .isString()
    .isIn(["wanna chat", "wanna call"])
    .withMessage("Motivation must be 'wanna chat' or 'wanna call'"),
  body("selfIntroduction").isString().notEmpty().withMessage("Self introduction must be a string"),
  handleValidationErrors,
];
