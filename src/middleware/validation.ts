import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import {
  ORIGIN_COUNTRIES,
  LANGUAGES,
  GENDERS,
  FLUENCY_LEVELS,
  MOTIVATIONS,
} from "../model/enums/enum";

const handleValidationErrors = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ errors: errors.array() });
    return;
  }
  next();
};

export const validateMyUserRequest = [
  body("name").isString().notEmpty().withMessage("Name must be a string"), // Required
  body("gender")
    .optional() 
    .isString()
    .isIn(GENDERS)
    .withMessage("Gender must be one of the predefined values"),
  body("city")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("City must be a string"),
  body("country")
    .optional()
    .isString()
    .notEmpty()
    .withMessage("Country must be a string"),
  body("originCountry")
    .optional() 
    .isString()
    .isIn(ORIGIN_COUNTRIES)
    .withMessage("Invalid origin country"),
  body("nativeLanguage")
    .isString()
    .isIn(LANGUAGES)
    .withMessage("Invalid native language"), 
  body("age")
    .optional()
    .trim()
    .toInt()
    .isInt({ min: 1 })
    .withMessage("Age must be a positive integer"),
  body("learningLanguage")
    .isString()
    .isIn(LANGUAGES)
    .withMessage("Invalid learning language"), 
  body("fluencyLevel")
    .optional() 
    .isString()
    .isIn(FLUENCY_LEVELS)
    .withMessage("Fluency level must be one of the predefined values"),
  body("motivation")
    .isString()
    .isIn(MOTIVATIONS)
    .withMessage("Motivation must be one of the predefined values"), 
  body("selfIntroduction")
    .optional() 
    .isString()
    .notEmpty()
    .withMessage("Self introduction must be a string"),
  handleValidationErrors,
];

