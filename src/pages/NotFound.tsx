import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <Helmet>
        <title>Página não encontrada — Anfitrião Sigma</title>
        <meta name="description" content="A página que você procura não existe. Volte ao início da Anfitrião Sigma." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://anfitriaosigma.com.br/404" />
        <meta property="og:title" content="Página não encontrada — Anfitrião Sigma" />
        <meta property="og:description" content="A página que você procura não existe." />
        <meta property="og:url" content="https://anfitriaosigma.com.br/404" />
      </Helmet>
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
