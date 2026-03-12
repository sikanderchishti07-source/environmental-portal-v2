const handler = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    try {
        const response = await fetch(
            'https://api.waqi.info/feed/riyadh/?token=a75b3351feeb73fe4c97498b3e9fb912f1f8e165'
        );
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
};
module.exports = handler;
