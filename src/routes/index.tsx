import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return <Navigate to="/ai-generator" replace />;
}

↓
SALVAR NO PROJETO
```

IMPORTANTE:

* Não criar um novo app.
* Não remover funcionalidades existentes.
* Não duplicar sistemas já existentes.
* Incorporar este painel ao aplicativo atual.
* Reutilizar autenticação, banco de dados e estrutura existente.
* Manter o padrão visual do app.
* Fazer o painel funcionar como uma parte nativa da plataforma.
    </div>
  );
}
