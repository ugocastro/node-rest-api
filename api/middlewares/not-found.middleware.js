'use strict';

module.exports = (req, res) => {
  return res.status(404)
    .json({ error: `${req.method} '${req.originalUrl}' not found` });
};
