var express = require('express');
var router = express.Router();
var rModel = require("../models/roomsModel");
            
router.get('/', async function(req, res, next) {
    let result = await rModel.getAllRooms();
    res.status(result.status).send(result.result);
});
            
router.get('/filter', async function(req, res, next) {
    let filters = req.query;
    console.log("Get rooms filtered by:");
    console.log(filters);
    let result = await rModel.getRoomByNameOrTopCard(filters);
    res.status(result.status).send(result.result);
});

router.get('/:id', async function(req, res, next) {
    let id = req.params.id;
    console.log("Get room with id "+id)
    let result = await rModel.getRoomById(id);
    res.status(result.status).send(result.result);
});

router.post('/:id/plays', async function(req, res, next) {
    let id = req.params.id;
    let cardPlayed = req.body.cardPlayed.toLowerCase();
    console.log(`Played card ${cardPlayed} on room with id ${id}`);
    let result = await rModel.play(id,cardPlayed);
    res.status(result.status).send(result.result);
});


module.exports = router;