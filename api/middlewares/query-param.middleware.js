'use strict';

/**
* Validates search query parameters.
* @function
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @param {object} next - Middleware function to be called.
* @returns {object}   - It should call the next middleware, but it can also returns
*                       400 if query param is invalid.
*/
module.exports = (req, res, next) => {
  req.checkQuery('page', "Must be an integer with '1' as min value")
    .optional().isInt({ min: 1 });
  req.checkQuery('limit', "Must be an integer with '1' as min value")
    .optional().isInt({ min: 1 });

  req.getValidationResult()
    .then(errors => {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      return next();
    });
};
