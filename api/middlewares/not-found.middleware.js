'use strict';

/**
* Last middleware called when route does not exist.
* @function
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should return 404 when a route does not exist.
*/
module.exports = (req, res) => {
  return res.status(404)
    .json({ error: `${req.method} '${req.originalUrl}' not found` });
};
