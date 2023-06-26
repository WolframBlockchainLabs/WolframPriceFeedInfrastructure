import helmet from 'helmet';

const helmetMiddleware = helmet({
    contentSecurityPolicy: true,
    crossOriginEmbedderPolicy: true,
    crossOriginOpenerPolicy: true,
    crossOriginResourcePolicy: true,
    originAgentCluster: true,
    referrerPolicy: true,
    strictTransportSecurity: true,
    xContentTypeOptions: true,
    xDnsPrefetchControl: true,
    xDownloadOptions: true,
    xFrameOptions: true,
    xPermittedCrossDomainPolicies: true,
    xPoweredBy: true,
    xXssProtection: true,
});

export default helmetMiddleware;
