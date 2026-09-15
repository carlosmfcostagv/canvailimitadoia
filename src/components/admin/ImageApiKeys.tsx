import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import { KeyRound, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  createImageApiKeyFn,
  deleteImageApiKeyFn,
  listImageApiKeysFn,
  updateImageApiKeyFn,
  IMAGE_PROVIDER_OPTIONS,
  type PublicImageApiKey,
} from '@/lib/image-keys.functions'

const MAX_KEYS = 20
const queryKey = ['image-api-keys']

export function ImageApiKeysSection() {
  const qc = useQueryClient()
  const listKeys = useServerFn(listImageApiKeysFn)
  const createKey = useServerFn(createImageApiKeyFn)
  const updateKey = useServerFn(updateImageApiKeyFn)
  const deleteKey = useServerFn(deleteImageApiKeyFn)

  const keysQuery = useQuery({ queryKey, queryFn: () => listKeys() })
  const invalidate = () => qc.invalidateQueries({ queryKey })

  const [label, setLabel] = useState('')
  const [provider, setProvider] = useState<string>('openai')
  const [apiKey, setApiKey] = useState('')
  const [model, setModel] = useState('')

  const create = useMutation({
    mutationFn: () =>
      createKey({ data: { label, provider, apiKey, ...(model ? { model } : {}) } }),
    onSuccess: () => {
      toast.success('API cadastrada')
      setLabel('')
      setApiKey('')
      setModel('')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const update = useMutation({
    mutationFn: (input: Parameters<typeof updateKey>[0]['data']) => updateKey({ data: input }),
    onSuccess: () => {
      toast.success('API atualizada')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const remove = useMutation({
    mutationFn: (id: string) => deleteKey({ data: { id } }),
    onSuccess: () => {
      toast.success('API removida')
      invalidate()
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const keys = keysQuery.data ?? []

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">APIs de geração de imagem</h2>
        <p className="text-sm text-muted-foreground">
          Cadastre até {MAX_KEYS} chaves. As imagens usam sempre a primeira API ativa da lista;
          quando uma fica sem crédito ela é marcada em vermelho e a próxima assume automaticamente.
        </p>
      </div>

      <div className="rounded-xl border bg-card p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-1.5">
            <Label className="text-xs">Nome</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Ex.: OpenAI conta 1"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Provedor</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {IMAGE_PROVIDER_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Chave da API</Label>
            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Modelo (opcional)</Label>
            <Input
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="gpt-image-1"
            />
          </div>
        </div>
        <Button
          disabled={create.isPending || label.trim().length < 2 || apiKey.trim().length < 10}
          onClick={() => create.mutate()}
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Cadastrar API ({keys.length}/{MAX_KEYS})
        </Button>
      </div>

      {keysQuery.isLoading && <p className="text-sm text-muted-foreground">Carregando APIs...</p>}
      {keys.length === 0 && !keysQuery.isLoading && (
        <p className="text-sm text-muted-foreground">
          Nenhuma API cadastrada — a geração de imagens ficará indisponível até cadastrar uma.
        </p>
      )}

      <div className="space-y-3">
        {keys.map((item, index) => (
          <KeyRow
            key={item.id}
            item={item}
            index={index}
            saving={update.isPending}
            onSave={(data) => update.mutate(data)}
            onDelete={() => remove.mutate(item.id)}
          />
        ))}
      </div>
    </section>
  )
}

function KeyRow({
  item,
  index,
  saving,
  onSave,
  onDelete,
}: {
  item: PublicImageApiKey
  index: number
  saving: boolean
  onSave: (data: any) => void
  onDelete: () => void
}) {
  const [label, setLabel] = useState(item.label)
  const [provider, setProvider] = useState(item.provider)
  const [model, setModel] = useState(item.model ?? '')
  const [newKey, setNewKey] = useState('')
  const exhausted = item.status === 'exhausted'

  return (
    <div
      className={
        'rounded-xl border bg-card p-4 space-y-4 ' +
        (exhausted ? 'border-destructive bg-destructive/5' : '')
      }
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">#{index + 1}</span>
          <span className={'font-medium ' + (exhausted ? 'text-destructive' : '')}>
            {item.label}
          </span>
          <Badge variant={exhausted ? 'destructive' : item.status === 'disabled' ? 'secondary' : 'default'}>
            {exhausted ? 'Sem crédito' : item.status === 'disabled' ? 'Desativada' : 'Ativa'}
          </Badge>
          <span className="text-xs text-muted-foreground">{item.masked_key}</span>
        </div>
        <div className="flex items-center gap-2">
          {exhausted || item.status === 'disabled' ? (
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => onSave({ id: item.id, status: 'active' })}
            >
              Reativar
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              disabled={saving}
              onClick={() => onSave({ id: item.id, status: 'disabled' })}
            >
              Desativar
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Remover ${item.label}`}
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {item.last_error && (
        <p className="text-xs text-destructive">Último erro: {item.last_error}</p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div className="space-y-1.5">
          <Label className="text-xs">Nome</Label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Provedor</Label>
          <Select value={provider} onValueChange={setProvider}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {IMAGE_PROVIDER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Modelo</Label>
          <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="padrão" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Trocar chave</Label>
          <Input
            type="password"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Nova chave (opcional)"
          />
        </div>
        <Button
          size="sm"
          disabled={saving}
          onClick={() => {
            onSave({
              id: item.id,
              label,
              provider,
              model,
              ...(newKey.trim().length >= 10 ? { apiKey: newKey.trim() } : {}),
            })
            setNewKey('')
          }}
        >
          Salvar
        </Button>
      </div>
    </div>
  )
}
