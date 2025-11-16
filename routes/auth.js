const express = require('express');
const router = express.Router();
//show signup form
router.get('/signup', (req, res) => {
    res.render('pages/signup');
});
router.post('/signup', (req, res) => {
    const { username, email, password } = req.body;
    console.log('New User:', { username, email, password });
    res.redirect('/');
});
module.exports = router;