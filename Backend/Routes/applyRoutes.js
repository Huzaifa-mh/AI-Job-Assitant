const { scanJobForm, mapFormFields, fillForm } = require('../Controller/applyController');

router.post('/scan',       protect, scanJobForm);
router.post('/map-fields', protect, mapFormFields);
router.post('/fill',       protect, fillForm);       // ← new