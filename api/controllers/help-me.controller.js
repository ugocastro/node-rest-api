'use strict';

const ProtectionAreaModel = require('../models/protection-area.model');
const SuperHeroModel = require('../models/super-hero.model');

/**
* Obtains up to 8 closest super heroes in a 10km radius given a position(latitude and longitude) as
* query params.
* @function helpMe
* @param {object} req - Express' request object.
* @param {object} res - Express' response object.
* @returns {object}   - It should returns an HTTP status 200 response with an {Array} of super heroes
*                       or an empty {Array} if no super hero is found, but it can also returns
*                       400 if required query parameters are not sent on request.
*/
exports.helpMe = (req, res) => {
  const RADIUS_IN_METERS = 10 * 1000;

  req.checkQuery('latitude', 'Latitude is required').notEmpty()
  req.checkQuery('latitude', 'Latitude must be a Float value').isFloat();
  req.checkQuery('longitude', "Longitude is required").notEmpty();
  req.checkQuery('longitude', 'Longitude must be a Float value').isFloat();

  req.getValidationResult()
    .then(errors => {
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const query = req.query;
      return ProtectionAreaModel
        .find({
          location: {
            $near: {
              $geometry: { type: 'Point', coordinates: [query.longitude, query.latitude] },
              $maxDistance: RADIUS_IN_METERS,
            }
          }
        })
      .then(areas => SuperHeroModel.find({ protectionArea: { $in: areas } }).limit(8))
      .then(superHeroes => res.json(superHeroes));
    });
};
