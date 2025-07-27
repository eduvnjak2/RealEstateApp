const express = require('express');
const router = express.Router();
const { Nekretnina, Upit } = require('../models');
const { Op } = require('sequelize');

// GET /nekretnine
router.get('/nekretnine', async (req, res) => {
    try {
        const nekretnine = await Nekretnina.findAll({
            include: [{
                model: Upit,
                attributes: ['id', 'tekst', 'KorisnikId']
            }]
        });
        res.json(nekretnine);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

// GET /nekretnina/:id
router.get('/nekretnina/:id', async (req, res) => {
    try {
        const nekretnina = await Nekretnina.findByPk(req.params.id, {
            include: [{
                model: Upit,
                limit: 3,
                order: [['createdAt', 'DESC']]
            }]
        });
        
        if (!nekretnina) {
            return res.status(404).json({ greska: "Nekretnina nije pronađena." });
        }
        
        res.json(nekretnina);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

// GET /next/upiti/nekretnina/:id
router.get('/next/upiti/nekretnina/:id', async (req, res) => {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 0;
    const limit = 3;
    const offset = page * limit;

    try {
        const upiti = await Upit.findAll({
            where: { NekretnineId: id },
            limit,
            offset,
            order: [['createdAt', 'DESC']]
        });

        res.json(upiti);
    } catch (error) {
        res.status(500).json({ greska: 'Internal Server Error' });
    }
});

module.exports = router; 