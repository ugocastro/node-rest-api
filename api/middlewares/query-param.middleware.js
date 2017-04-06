'use strict';

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
