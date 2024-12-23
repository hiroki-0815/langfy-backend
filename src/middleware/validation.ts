import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

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
  body("gender").isString().notEmpty().withMessage("Gender must be a string"),
  body("city").isString().notEmpty().withMessage("City must be a string"),
  body("country").isString().notEmpty().withMessage("Country must be a string"),
  body("age")
    .isInt({ min: 1 })
    .notEmpty()
    .withMessage("Age must be a positive integer and at least 1"),
  body("learningLanguage").isString().notEmpty().withMessage("Learning Language must be a string"),
  body("fluencyLevel").isString().notEmpty().withMessage("Fluency level must be a string"),
  body("motivation").isString().notEmpty().withMessage("Motivation must be a string"),
  body("selfIntroduction").isString().notEmpty().withMessage("Self introduction must be a string"),
  handleValidationErrors,
];