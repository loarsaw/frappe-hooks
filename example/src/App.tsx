import React, { useState, useRef } from 'react';
import {
  useAuth,
  useDocuments,
  useDocument,
  useCreateDocument,
  useUpdateDocument,
  useDeleteDocument,
  useUploadFile,
  type QueryOptions,
} from '@rustedcompiler/frappe-hooks';

type Tab = 'auth' | 'documents' | 'document' | 'create' | 'update' | 'delete' | 'upload';

function Badge({
  type,
  children,
}: {
  type: 'success' | 'error' | 'info' | 'warning';
  children: React.ReactNode;
}) {
  const colors: Record<string, React.CSSProperties> = {
    success: { background: '#f0fdf4', color: '#166534', border: '0.5px solid #bbf7d0' },
    error: { background: '#fef2f2', color: '#991b1b', border: '0.5px solid #fecaca' },
    info: { background: '#eff6ff', color: '#1e40af', border: '0.5px solid #bfdbfe' },
    warning: { background: '#fffbeb', color: '#92400e', border: '0.5px solid #fde68a' },
  };
  return (
    <span
      style={{
        fontSize: 12,
        padding: '2px 8px',
        borderRadius: 6,
        fontWeight: 500,
        ...colors[type],
      }}
    >
      {children}
    </span>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: '0.5px solid #e5e7eb',
        borderRadius: 12,
        padding: '1rem 1.25rem',
        marginBottom: '1rem',
        background: '#fff',
      }}
    >
      <h3 style={{ margin: '0 0 1rem', fontSize: 15, fontWeight: 500 }}>{title}</h3>
      {children}
    </div>
  );
}

function JsonView({ data }: { data: unknown }) {
  return (
    <pre
      style={{
        background: '#f8fafc',
        border: '0.5px solid #e2e8f0',
        borderRadius: 8,
        padding: '0.75rem',
        fontSize: 12,
        overflowX: 'auto',
        maxHeight: 200,
        margin: '0.5rem 0 0',
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

function AuthTab() {
  const {
    login,
    loginWithAPIToken,
    dynamicLogin,
    logout,
    getCurrentUser,
    isLoading,
    error,
    isAuthenticated,
  } = useAuth();
  const [username, setUsername] = useState('Administrator');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [method, setMethod] = useState<'password' | 'token' | 'dynamic'>('password');

  const handleLogin = async () => {
    try {
      let res;
      if (method === 'password') res = await login(username, password);
      else if (method === 'token') res = await loginWithAPIToken(apiKey, apiSecret);
      else res = await dynamicLogin(apiKey ? { apiKey, apiSecret } : { username, password });
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    }
  };

  const handleGetUser = async () => {
    try {
      const res = await getCurrentUser();
      setResult(res);
    } catch (e: any) {
      setResult({ error: e.message });
    }
  };

  return (
    <div>
      <Card title="Authentication status">
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge type={isAuthenticated ? 'success' : 'error'}>
            {isAuthenticated ? 'Authenticated' : 'Not authenticated'}
          </Badge>
          {isAuthenticated && (
            <button onClick={logout} disabled={isLoading} style={{ marginLeft: 'auto' }}>
              {isLoading ? 'Logging out...' : 'Logout'}
            </button>
          )}
          {isAuthenticated && (
            <button onClick={handleGetUser} disabled={isLoading}>
              Get current user
            </button>
          )}
        </div>
      </Card>

      <Card title="Login">
        <div style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
          {(['password', 'token', 'dynamic'] as const).map(m => (
            <label
              key={m}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="method"
                value={m}
                checked={method === m}
                onChange={() => setMethod(m)}
              />
              {m}
            </label>
          ))}
        </div>

        {(method === 'password' || method === 'dynamic') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <input
              placeholder="Username"
              value={username}
              onChange={e => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
        )}

        {(method === 'token' || method === 'dynamic') && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
            <input placeholder="API Key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
            <input
              type="password"
              placeholder="API Secret"
              value={apiSecret}
              onChange={e => setApiSecret(e.target.value)}
            />
          </div>
        )}

        <button onClick={handleLogin} disabled={isLoading}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>

        {error && <Badge type="error">{error.message}</Badge>}
        {result && <JsonView data={result} />}
      </Card>
    </div>
  );
}

function DocumentsTab() {
  const [doctype, setDoctype] = useState('User');
  const [fields, setFields] = useState('name,email');
  const [limit, setLimit] = useState(5);
  const [limitStart, setLimitStart] = useState(0);
  const [filterField, setFilterField] = useState('');
  const [filterOperator, setFilterOperator] = useState('=');
  const [filterValue, setFilterValue] = useState('');
  const [orderBy, setOrderBy] = useState('');
  const [expand, setExpand] = useState('');
  const [asDict, setAsDict] = useState(true);
  const [debug, setDebug] = useState(false);
  const [isOr, setIsOr] = useState(false);

  const [submitted, setSubmitted] = useState({
    doctype: 'User',
    fields: 'name,email',
    limit: 5,
    limitStart: 0,
    filterField: '',
    filterOperator: '=',
    filterValue: '',
    orderBy: '',
    expand: '',
    asDict: true,
    debug: false,
    isOr: false,
  });

  const options: QueryOptions = {
    fields: submitted.fields
      .split(',')
      .map(f => f.trim())
      .filter(Boolean),
    limit_page_length: submitted.limit,
    limit_start: submitted.limitStart,
    as_dict: submitted.asDict,
    debug: submitted.debug,
    is_or: submitted.isOr,
  };

  if (submitted.filterField && submitted.filterValue) {
    options.filters = [
      [submitted.doctype, submitted.filterField, submitted.filterOperator, submitted.filterValue],
    ];
  }

  if (submitted.orderBy) {
    options.order_by = submitted.orderBy;
  }

  if (submitted.expand) {
    options.expand = submitted.expand
      .split(',')
      .map(f => f.trim())
      .filter(Boolean);
  }

  const { data, isLoading, error } = useDocuments(submitted.doctype, options);

  return (
    <div>
      <Card title="Query builder">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Doctype (e.g. User)"
            value={doctype}
            onChange={e => setDoctype(e.target.value)}
          />
          <input
            placeholder="Fields (comma separated)"
            value={fields}
            onChange={e => setFields(e.target.value)}
          />
          <input
            placeholder="Filter field"
            value={filterField}
            onChange={e => setFilterField(e.target.value)}
          />
          <select
            value={filterOperator}
            onChange={e => setFilterOperator(e.target.value)}
            style={{
              padding: '4px 6px',
              borderRadius: 6,
              border: '0.5px solid #e5e7eb',
              fontSize: 13,
            }}
          >
            <option value="=">= equals</option>
            <option value="!=">!= not equal</option>
            <option value="like">like</option>
            <option value="not like">not like</option>
            <option value=">">&gt; greater than</option>
            <option value="<">&lt; less than</option>
            <option value=">=">&gt;= gte</option>
            <option value="<=">&lt;= lte</option>
            <option value="in">in</option>
            <option value="not in">not in</option>
          </select>
          <input
            placeholder="Filter value"
            value={filterValue}
            onChange={e => setFilterValue(e.target.value)}
          />
          <input
            placeholder="order_by (e.g. creation desc)"
            value={orderBy}
            onChange={e => setOrderBy(e.target.value)}
          />
          <input
            placeholder="expand (comma separated fields)"
            value={expand}
            onChange={e => setExpand(e.target.value)}
          />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            marginBottom: 8,
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13 }}>Limit</label>
            <input
              type="number"
              value={limit}
              min={1}
              max={100}
              onChange={e => setLimit(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <label style={{ fontSize: 13 }}>Start</label>
            <input
              type="number"
              value={limitStart}
              min={0}
              onChange={e => setLimitStart(Number(e.target.value))}
              style={{ width: 70 }}
            />
          </div>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={asDict} onChange={e => setAsDict(e.target.checked)} />
            as_dict
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={debug} onChange={e => setDebug(e.target.checked)} />
            debug
          </label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            <input type="checkbox" checked={isOr} onChange={e => setIsOr(e.target.checked)} />
            is_or
          </label>
        </div>

        <button
          onClick={() =>
            setSubmitted({
              doctype,
              fields,
              limit,
              limitStart,
              filterField,
              filterOperator,
              filterValue,
              orderBy,
              expand,
              asDict,
              debug,
              isOr,
            })
          }
        >
          Fetch documents
        </button>
      </Card>

      <Card title={`Results — ${submitted.doctype}`}>
        {isLoading && <Badge type="info">Loading...</Badge>}
        {error && <Badge type="error">{error.message}</Badge>}
        {!isLoading && !error && (
          <>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
              <Badge type="success">{data.length} records returned</Badge>
              {submitted.debug && <Badge type="warning">debug mode on</Badge>}
              {submitted.isOr && <Badge type="info">OR filter mode</Badge>}
              {!submitted.asDict && <Badge type="info">returned as List[List]</Badge>}
            </div>
            <JsonView data={data} />
          </>
        )}
      </Card>
    </div>
  );
}
function DocumentTab() {
  const [doctype, setDoctype] = useState('User');
  const [name, setName] = useState('Administrator');
  const [expandLinks, setExpandLinks] = useState(false);
  const [submitted, setSubmitted] = useState({
    doctype: 'User',
    name: 'Administrator',
    expand: false,
  });

  const { data, isLoading, error } = useDocument(
    submitted.doctype,
    submitted.name,
    submitted.expand
  );

  return (
    <div>
      <Card title="Fetch single document">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Doctype" value={doctype} onChange={e => setDoctype(e.target.value)} />
          <input placeholder="Document name" value={name} onChange={e => setName(e.target.value)} />
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            marginBottom: 8,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={expandLinks}
            onChange={e => setExpandLinks(e.target.checked)}
          />
          Expand link fields
        </label>
        <button onClick={() => setSubmitted({ doctype, name, expand: expandLinks })}>
          Fetch document
        </button>
      </Card>

      <Card title="Result">
        {isLoading && <Badge type="info">Loading...</Badge>}
        {error && <Badge type="error">{error.message}</Badge>}
        {!isLoading && !error && data && (
          <>
            <Badge type="success">Found</Badge>
            <JsonView data={data} />
          </>
        )}
        {!isLoading && !error && !data && (
          <span style={{ fontSize: 13, color: '#6b7280' }}>No data</span>
        )}
      </Card>
    </div>
  );
}

function CreateTab() {
  const [doctype, setDoctype] = useState('ToDo');
  const [jsonData, setJsonData] = useState('{\n  "description": "Test todo from frappe-hooks"\n}');
  const [result, setResult] = useState<unknown>(null);

  const { mutate, isLoading, error } = useCreateDocument({
    onSuccess: d => setResult(d),
    onError: e => setResult({ error: e.message }),
    invalidate: /^docs:/,
  });

  const handleCreate = async () => {
    try {
      const data = JSON.parse(jsonData);
      await mutate({ docType: doctype, data });
    } catch (e: any) {
      setResult({ error: e.message });
    }
  };

  return (
    <div>
      <Card title="Create document">
        <input
          placeholder="Doctype"
          value={doctype}
          onChange={e => setDoctype(e.target.value)}
          style={{ marginBottom: 8 }}
        />
        <textarea
          value={jsonData}
          onChange={e => setJsonData(e.target.value)}
          rows={6}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 12,
            padding: 8,
            borderRadius: 6,
            border: '0.5px solid #e5e7eb',
            marginBottom: 8,
            boxSizing: 'border-box',
          }}
        />
        <button onClick={handleCreate} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create document'}
        </button>
        {error && (
          <>
            <br />
            <Badge type="error">{error.message}</Badge>
          </>
        )}
      </Card>

      {result && (
        <Card title="Result">
          <Badge type={'error' in (result as any) ? 'error' : 'success'}>
            {'error' in (result as any) ? 'Failed' : 'Created'}
          </Badge>
          <JsonView data={result} />
        </Card>
      )}
    </div>
  );
}

function UpdateTab() {
  const [doctype, setDoctype] = useState('ToDo');
  const [documentId, setDocumentId] = useState('');
  const [jsonData, setJsonData] = useState('{\n  "description": "Updated via frappe-hooks"\n}');
  const [result, setResult] = useState<unknown>(null);

  const { mutate, isLoading, error } = useUpdateDocument({
    onSuccess: d => setResult(d),
    onError: e => setResult({ error: e.message }),
  });

  const handleUpdate = async () => {
    try {
      const data = JSON.parse(jsonData);
      await mutate({ docType: doctype, documentId, data });
    } catch (e: any) {
      setResult({ error: e.message });
    }
  };

  return (
    <div>
      <Card title="Update document">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input placeholder="Doctype" value={doctype} onChange={e => setDoctype(e.target.value)} />
          <input
            placeholder="Document ID / name"
            value={documentId}
            onChange={e => setDocumentId(e.target.value)}
          />
        </div>
        <textarea
          value={jsonData}
          onChange={e => setJsonData(e.target.value)}
          rows={5}
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: 12,
            padding: 8,
            borderRadius: 6,
            border: '0.5px solid #e5e7eb',
            marginBottom: 8,
            boxSizing: 'border-box',
          }}
        />
        <button onClick={handleUpdate} disabled={isLoading || !documentId}>
          {isLoading ? 'Updating...' : 'Update document'}
        </button>
        {error && (
          <>
            <br />
            <Badge type="error">{error.message}</Badge>
          </>
        )}
      </Card>

      {result && (
        <Card title="Result">
          <Badge type={'error' in (result as any) ? 'error' : 'success'}>
            {'error' in (result as any) ? 'Failed' : 'Updated'}
          </Badge>
          <JsonView data={result} />
        </Card>
      )}
    </div>
  );
}

function DeleteTab() {
  const [doctype, setDoctype] = useState('ToDo');
  const [documentId, setDocumentId] = useState('');
  const [result, setResult] = useState<unknown>(null);
  const [confirmed, setConfirmed] = useState(false);

  const { mutate, isLoading, error } = useDeleteDocument({
    onSuccess: () => setResult({ deleted: true, doctype, documentId }),
    onError: e => setResult({ error: e.message }),
  });

  const handleDelete = async () => {
    if (!confirmed) {
      setConfirmed(true);
      return;
    }
    try {
      await mutate({ docType: doctype, documentId });
      setConfirmed(false);
    } catch (_e) {
    }
  };

  return (
    <div>
      <Card title="Delete document">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input
            placeholder="Doctype"
            value={doctype}
            onChange={e => {
              setDoctype(e.target.value);
              setConfirmed(false);
            }}
          />
          <input
            placeholder="Document ID / name"
            value={documentId}
            onChange={e => {
              setDocumentId(e.target.value);
              setConfirmed(false);
            }}
          />
        </div>
        <button
          onClick={handleDelete}
          disabled={isLoading || !documentId}
          style={
            confirmed ? { background: '#fef2f2', color: '#991b1b', borderColor: '#fecaca' } : {}
          }
        >
          {isLoading
            ? 'Deleting...'
            : confirmed
              ? 'Click again to confirm delete'
              : 'Delete document'}
        </button>
        {confirmed && (
          <>
            {' '}
            <Badge type="warning">
              This will permanently delete {doctype}/{documentId}
            </Badge>
          </>
        )}
        {error && (
          <>
            <br />
            <Badge type="error">{error.message}</Badge>
          </>
        )}
      </Card>

      {result && (
        <Card title="Result">
          <Badge type={'error' in (result as any) ? 'error' : 'success'}>
            {'error' in (result as any) ? 'Failed' : 'Deleted'}
          </Badge>
          <JsonView data={result} />
        </Card>
      )}
    </div>
  );
}

function UploadTab() {
  const [file, setFile] = useState<File | null>(null);
  const [doctype, setDoctype] = useState('');
  const [docname, setDocname] = useState('');
  const [fieldname, setFieldname] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { upload, isLoading, error, data } = useUploadFile({
    onSuccess: d => console.log('Uploaded:', d),
    onError: e => console.error('Upload failed:', e),
  });

  const handleUpload = async () => {
    if (!file) return;
    await upload(file, {
      doctype: doctype || undefined,
      docname: docname || undefined,
      fieldname: fieldname || undefined,
      isPrivate,
    });
  };

  return (
    <div>
      <Card title="Upload file">
        <input
          ref={fileRef}
          type="file"
          onChange={e => setFile(e.target.files?.[0] ?? null)}
          style={{ marginBottom: 8 }}
        />
        {file && (
          <Badge type="info">
            {file.name} — {(file.size / 1024).toFixed(1)} KB
          </Badge>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, margin: '8px 0' }}>
          <input
            placeholder="Attach to doctype (optional)"
            value={doctype}
            onChange={e => setDoctype(e.target.value)}
          />
          <input
            placeholder="Document name (optional)"
            value={docname}
            onChange={e => setDocname(e.target.value)}
          />
          <input
            placeholder="Field name (optional)"
            value={fieldname}
            onChange={e => setFieldname(e.target.value)}
          />
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 13,
            marginBottom: 8,
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={isPrivate}
            onChange={e => setIsPrivate(e.target.checked)}
          />
          Private file
        </label>
        <button onClick={handleUpload} disabled={isLoading || !file}>
          {isLoading ? 'Uploading...' : 'Upload file'}
        </button>
        {error && (
          <>
            <br />
            <Badge type="error">{error.message}</Badge>
          </>
        )}
      </Card>

      {data && (
        <Card title="Result">
          <Badge type="success">Uploaded</Badge>
          <JsonView data={data} />
          {data?.message?.file_url && (
            <img
              src={data.message.file_url}
              alt="uploaded"
              style={{
                marginTop: 8,
                maxWidth: '100%',
                maxHeight: 200,
                borderRadius: 6,
                border: '0.5px solid #e5e7eb',
              }}
            />
          )}
        </Card>
      )}
    </div>
  );
}

const TABS: { id: Tab; label: string }[] = [
  { id: 'auth', label: 'Auth' },
  { id: 'documents', label: 'useDocuments' },
  { id: 'document', label: 'useDocument' },
  { id: 'create', label: 'useCreateDocument' },
  { id: 'update', label: 'useUpdateDocument' },
  { id: 'delete', label: 'useDeleteDocument' },
  { id: 'upload', label: 'Upload' },
];

export default function FrappeHooksTestBench() {
  const [activeTab, setActiveTab] = useState<Tab>('auth');

  const tabContent: Record<Tab, React.ReactNode> = {
    auth: <AuthTab />,
    documents: <DocumentsTab />,
    document: <DocumentTab />,
    create: <CreateTab />,
    update: <UpdateTab />,
    delete: <DeleteTab />,
    upload: <UploadTab />,
  };

  return (
    <div
      style={{
        maxWidth: 700,
        margin: '0 auto',
        padding: '1.5rem 1rem',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, margin: '0 0 4px' }}>
          frappe-hooks test bench
        </h1>
        <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
          Live test against <code style={{ fontSize: 12 }}>http://localhost:8000</code>
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 4,
          flexWrap: 'wrap',
          marginBottom: '1.5rem',
          borderBottom: '0.5px solid #e5e7eb',
          paddingBottom: 0,
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #374151' : '2px solid transparent',
              borderRadius: 0,
              padding: '6px 12px',
              fontSize: 13,
              fontWeight: activeTab === tab.id ? 500 : 400,
              color: activeTab === tab.id ? '#111827' : '#6b7280',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {tabContent[activeTab]}
    </div>
  );
}
