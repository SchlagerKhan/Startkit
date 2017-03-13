import express from 'express';

const router = express.Router();

router.get('/test', (req, res) => res.send({success: true, message: 'test'}));

router.get('/', (req, res) => {
	res.send('Api base not implemented');
});
router.all('*', (req, res) => {
	res.sendStatus(404);
});


module.exports = router;
