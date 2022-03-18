var pool = require('./connection.js')

module.exports.getAllCards = async function () {
    try {
      let sql = `select * from room, card, cardwcard
                where room.roo_id = $1 and
                room.roo_topcard_id = cardwcard.cwc_clooses_id and
                card.crd_id = cardwcard.cwc_cwins_id and
                card.crd_name ILIKE $2;`
      let result = await pool.query(sql);
      let cards = result.rows;
      return { status: 200, result: cards };
    } catch (err) {
      console.log(err);
      return { status: 500, result: err };
    }
  }

  