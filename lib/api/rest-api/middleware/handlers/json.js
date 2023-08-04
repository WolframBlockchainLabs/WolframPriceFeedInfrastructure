import express from 'express';

const jsonMiddleware = express.json({
    limit: '20mb',
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf.toString());
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(
                JSON.stringify({
                    status: 0,
                    error: {
                        code: 'BROKEN_JSON',
                        message: 'Please, verify your json',
                    },
                }),
            );

            throw new Error('BROKEN_JSON');
        }
    },
});

export default jsonMiddleware;
