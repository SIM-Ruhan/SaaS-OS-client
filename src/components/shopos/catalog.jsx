'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FiArchive,
  FiDownload,
  FiEdit2,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiUpload,
} from 'react-icons/fi';
import {
  Button,
  Empty,
  Field,
  Heading,
  IconButton,
  Notice,
  ProductImage,
  Rise,
  Status,
  Table,
  Toggle,
} from './ui';
import { Feedback, NeedShop, Resource, useMutation, useShopResource, useWorkspace } from './workspace';
import { getFields, money, request, shopPath, workspaceLink } from '@/lib/shopos';

const mapFields = [
  'name',
  'description',
  'price',
  'stock',
  'sku',
  'category',
  'imageUrl',
  'active',
  'tags',
  'videoUrl',
  'weight',
  'lowStock',
  'backorder',
  'codEnabled',
  'seoTitle',
  'seoDescription',
];
function ImportPanel({ reload }) {
  const { slug } = useWorkspace();
  const [file, setFile] = useState(null),
    [mapping, setMapping] = useState({}),
    [preview, setPreview] = useState(null),
    [validMap, setValidMap] = useState('');
  const [imageFile, setImageFile] = useState(null),
    [folderFiles, setFolderFiles] = useState([]),
    [imageProgress, setImageProgress] = useState(false),
    [imageResult, setImageResult] = useState(null);
  const action = useMutation(),
    images = useMutation(reload);
  async function send(previewOnly) {
    const data = new FormData();
    data.set('file', file);
    data.set('mapping', JSON.stringify(mapping));
    const result = await action.mutate(
      shopPath(slug, `/products/import${previewOnly ? '?preview=1' : ''}`),
      'POST',
      data,
      previewOnly ? undefined : (value) => `Imported ${value.imported} products.`,
    );
    if (!result) return;
    if (previewOnly) {
      setPreview(result);
      setValidMap(JSON.stringify(mapping));
    } else {
      setPreview(null);
      setFile(null);
      reload();
    }
  }
  async function sendImages() {
    const path = shopPath(slug, '/products/images');
    if (imageFile) {
      const data = new FormData();
      data.set('file', imageFile);
      const result = await images.mutate(path, 'POST', data);
      if (result) setImageResult(result);
      return;
    }
    setImageProgress(true);
    const result = { updated: [], unmatched: [], failed: [] };
    const batches = [];
    let batch = [],
      size = 0;
    for (const file of folderFiles) {
      if (file.size > 3_500_000) {
        result.failed.push({ sku: file.name, error: 'Image exceeds 3.5 MB.' });
        continue;
      }
      if (batch.length === 8 || size + file.size > 3_700_000) {
        batches.push(batch);
        batch = [];
        size = 0;
      }
      batch.push(file);
      size += file.size;
    }
    if (batch.length) batches.push(batch);
    try {
      for (const files of batches) {
        const data = new FormData();
        for (const file of files) data.append('images', file);
        try {
          const next = await request(path, { method: 'POST', data });
          for (const key of Object.keys(result)) result[key].push(...next[key]);
        } catch (error) {
          result.failed.push(...files.map((file) => ({ sku: file.name, error: error.message })));
        }
      }
      setImageResult(result);
      reload();
    } finally {
      setImageProgress(false);
    }
  }
  return (
    <div className="grid-2">
      <section className="surface stack">
        <div>
          <h2>Import a CSV</h2>
          <p className="muted fine">
            Upload up to 500 products. Match columns and review the preview before publishing.
          </p>
        </div>
        <Field
          label="Product CSV"
          type="file"
          accept=".csv,text/csv"
          onChange={(event) => {
            setFile(event.target.files[0]);
            setMapping({});
            setPreview(null);
          }}
        />
        <div className="row">
          <Button tone="secondary" disabled={!file || action.busy} onClick={() => send(true)}>
            Validate preview
          </Button>
          <Button
            disabled={
              !file ||
              !preview?.valid ||
              preview.errors.length > 0 ||
              JSON.stringify(mapping) !== validMap ||
              action.busy
            }
            onClick={() => send(false)}
          >
            Import products
          </Button>
        </div>
        <Feedback action={action} />
        {preview && (
          <>
            <details>
              <summary className="font-bold cursor-pointer">Column mapping</summary>
              <div className="fields mt-3">
                {mapFields.map((field) => (
                  <Field key={field} label={field}>
                    <select
                      value={mapping[field] || ''}
                      onChange={(event) => setMapping({ ...mapping, [field]: event.target.value })}
                    >
                      <option value="">Match by column name</option>
                      {preview.headers.map((header) => (
                        <option key={header}>{header}</option>
                      ))}
                    </select>
                  </Field>
                ))}
              </div>
            </details>
            <Notice tone={preview.errors.length ? 'warn' : 'success'}>
              {preview.valid} valid rows · {preview.errors.length} errors
            </Notice>
            {preview.errors.length > 0 && (
              <ul className="fine max-h-42 overflow-auto">
                {preview.errors.map((item) => (
                  <li key={item.row}>
                    Row {item.row}. {item.error}
                  </li>
                ))}
              </ul>
            )}
            {preview.sample.length > 0 && (
              <ul className="fine muted">
                {preview.sample.map((item, index) => (
                  <li key={`${item.name}-${index}`}>
                    {item.name} · {item.sku || 'No SKU'} · {item.stock} in stock
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>
      <section className="surface stack">
        <div>
          <h2>Match product images by SKU</h2>
          <p className="muted fine">
            Select a folder or ZIP of JPEG, PNG, GIF or WebP files named after their SKUs, such as
            MUG-01.jpg. Image uploads use your server’s ImgBB connection.
          </p>
        </div>
        <Field
          label="Image ZIP"
          type="file"
          accept=".zip,application/zip"
          onChange={(event) => {
            const archive = event.target.files[0];
            setImageFile(archive);
            if (archive) setFolderFiles([]);
            setImageResult(null);
          }}
        />
        <Field
          label="Image folder"
          type="file"
          webkitdirectory=""
          multiple
          onChange={(event) => {
            const selected = [...event.target.files].filter((file) =>
              /\.(jpe?g|png|gif|webp)$/i.test(file.name),
            );
            setFolderFiles(selected);
            if (selected.length) setImageFile(null);
            setImageResult(null);
          }}
        />
        {folderFiles.length > 0 && <p className="fine muted">{folderFiles.length} images selected</p>}
        <div>
          <Button
            tone="secondary"
            disabled={(!imageFile && !folderFiles.length) || images.busy || imageProgress}
            onClick={sendImages}
          >
            <FiUpload /> {imageProgress ? 'Uploading…' : 'Upload images'}
          </Button>
        </div>
        <Feedback action={images} />
        {imageResult && (
          <div className="muted-block fine">
            <p>{imageResult.updated.length} images matched.</p>
            {imageResult.unmatched.length > 0 && <p>Unmatched: {imageResult.unmatched.join(', ')}</p>}
            {imageResult.failed.map((item, index) => (
              <p key={`${item.sku}-${index}`}>
                {item.sku}: {item.error}
              </p>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
export function Catalog() {
  const { shop, slug, canManage } = useWorkspace();
  const [query, setQuery] = useState(''),
    [search, setSearch] = useState(''),
    [selected, setSelected] = useState([]),
    [importing, setImporting] = useState(false),
    [offset, setOffset] = useState(0);
  const source = useShopResource(
    `/products?all=1&limit=50&skip=${offset}&q=${encodeURIComponent(search)}`,
  );
  const action = useMutation(source.reload);
  const selectedIds = selected.filter((id) => source.data?.some((item) => item.id === id));
  async function bulk(event) {
    event.preventDefault();
    const form = event.currentTarget,
      fields = getFields(form);
    const data = { ids: selectedIds };
    for (const key of ['price', 'stock', 'category', 'active'])
      if (fields[key] !== '') data[key] = fields[key];
    if (
      await action.mutate(
        shopPath(slug, '/products/bulk'),
        'POST',
        data,
        (result) => `Updated ${result.updated} products.`,
      )
    ) {
      setSelected([]);
      form.reset();
    }
  }
  return (
    <>
      <Heading
        eyebrow="Catalog"
        title="Products"
        description="Manage inventory, variants, prices, and visibility."
        actions={
          shop && canManage ? (
            <>
              <Button
                tone="secondary"
                onClick={() => setImporting(!importing)}
                aria-expanded={importing}
              >
                <FiUpload /> Import
              </Button>
              <a
                className="button button-secondary"
                href={`/api/shopos${shopPath(slug, '/products/export')}`}
              >
                <FiDownload /> CSV
              </a>
              <Button href={workspaceLink('/dashboard/products/new', slug)}>
                <FiPlus /> Add product
              </Button>
            </>
          ) : null
        }
      />
      <NeedShop>
        <div className="stack-lg">
          {importing && (
            <Rise>
              <ImportPanel reload={source.reload} />
            </Rise>
          )}
          <section className="surface stack">
            <form
              className="row"
              onSubmit={(event) => {
                event.preventDefault();
                setSearch(query.trim());
                setOffset(0);
              }}
            >
              <div className="field min-w-0 grow">
                <input
                  aria-label="Search by product name"
                  placeholder="Search products"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
              <Button tone="secondary" type="submit">
                <FiSearch /> Search
              </Button>
            </form>
            <Feedback action={action} />
            {selectedIds.length > 0 && canManage && (
              <form className="fields fields-3 muted-block" onSubmit={bulk}>
                <p className="field-span font-bold">Edit {selectedIds.length} selected</p>
                <Field label="Price" name="price" type="number" min="0" step=".01" />
                <Field label="Stock" name="stock" type="number" min="0" />
                <Field label="Category" name="category" />
                <Field label="Visibility">
                  <select name="active">
                    <option value="">Keep current</option>
                    <option value="true">Publish</option>
                    <option value="false">Archive</option>
                  </select>
                </Field>
                <div className="field-span">
                  <Button type="submit" disabled={action.busy}>
                    Apply changes
                  </Button>
                </div>
              </form>
            )}
            <Resource source={source}>
              {(items) => (
                <>
                  <Table
                    columns={['Select', 'Product', 'SKU', 'Price', 'Stock', 'Status', 'Actions']}
                    rows={items}
                    empty="No products match this view"
                    render={(item) => (
                      <>
                        <td>
                          <input
                            aria-label={`Select ${item.name}`}
                            type="checkbox"
                            checked={selectedIds.includes(item.id)}
                            onChange={(event) =>
                              setSelected((previous) =>
                                event.target.checked
                                  ? [...previous, item.id]
                                  : previous.filter((id) => id !== item.id),
                              )
                            }
                          />
                        </td>
                        <td>
                          <div className="catalog-name">
                            <ProductImage src={item.imageUrl} />
                            <div>
                              <strong>{item.name}</strong>
                              <small className="block">{item.category || 'Uncategorized'}</small>
                            </div>
                          </div>
                        </td>
                        <td>{item.sku || '—'}</td>
                        <td>{money(item.price, shop.currency)}</td>
                        <td>
                          {item.variants?.length
                            ? item.variants.reduce((sum, variant) => sum + variant.stock, 0)
                            : item.stock}
                        </td>
                        <td>
                          <Status
                            value={
                              item.moderation === 'hidden'
                                ? 'hidden'
                                : item.active === false
                                  ? 'draft'
                                  : 'active'
                            }
                          />
                        </td>
                        <td>
                          <div className="row no-wrap flex-nowrap">
                            {canManage ? (
                              <>
                                <Link
                                  className="icon-button"
                                  aria-label={`Edit ${item.name}`}
                                  href={`${workspaceLink('/dashboard/products/new', slug)}&edit=${item.id}`}
                                >
                                  <FiEdit2 />
                                </Link>
                                <IconButton
                                  icon={FiArchive}
                                  label={item.active === false ? 'Publish product' : 'Archive product'}
                                  disabled={action.busy}
                                  onClick={() =>
                                    action.mutate(
                                      shopPath(slug, `/products/${item.id}`),
                                      'PUT',
                                      { active: item.active === false },
                                      'Visibility updated.',
                                    )
                                  }
                                />
                                <IconButton
                                  icon={FiTrash2}
                                  label={`Delete ${item.name}`}
                                  disabled={action.busy}
                                  onClick={() => {
                                    if (window.confirm(`Delete ${item.name}?`))
                                      action.mutate(
                                        shopPath(slug, `/products/${item.id}`),
                                        'DELETE',
                                        undefined,
                                        'Product deleted.',
                                      );
                                  }}
                                />
                              </>
                            ) : (
                              <span>View only</span>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  />
                  {(offset > 0 || items.length === 50) && (
                    <div className="row">
                      <Button tone="secondary" disabled={!offset} onClick={() => setOffset(offset - 50)}>
                        Previous
                      </Button>
                      <Button
                        tone="secondary"
                        disabled={items.length < 50}
                        onClick={() => setOffset(offset + 50)}
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </Resource>
          </section>
        </div>
      </NeedShop>
    </>
  );
}
function ProductFields({ product, reload }) {
  const { shop, slug } = useWorkspace(),
    router = useRouter();
  const [attributes, setAttributes] = useState(product?.attributes || []),
    [variants, setVariants] = useState(product?.variants || []);
  const [file, setFile] = useState(null);
  const action = useMutation(reload);
  function changeAttribute(index, key, value) {
    setAttributes((items) => items.map((item, n) => (n === index ? { ...item, [key]: value } : item)));
  }
  function changeVariant(index, key, value) {
    setVariants((items) => items.map((item, n) => (n === index ? { ...item, [key]: value } : item)));
  }
  function generate() {
    const entries = attributes
      .map((item) => [
        item.name.trim(),
        (Array.isArray(item.values) ? item.values : item.values.split(','))
          .map((value) => value.trim())
          .filter(Boolean),
      ])
      .filter(([name, values]) => name && values.length);
    let output = [{}];
    for (const [name, values] of entries) {
      if (output.length * values.length > 80) {
        action.setMessage({
          tone: 'error',
          text: 'Use fewer attribute values. A product can have up to 80 variants.',
        });
        return;
      }
      output = output.flatMap((row) => values.map((value) => ({ ...row, [name]: value })));
    }
    if (entries.length)
      setVariants(
        output.map((options) => {
          const name = Object.values(options).join(' / ');
          return (
            variants.find((item) => item.name === name) || {
              id: crypto.randomUUID(),
              name,
              sku: '',
              price: '',
              stock: 0,
              imageUrl: '',
              options,
            }
          );
        }),
      );
  }
  async function save(event) {
    event.preventDefault();
    const fields = getFields(event.currentTarget);
    const data = new FormData();
    for (const [key, value] of Object.entries(fields)) data.set(key, value);
    data.set(
      'images',
      JSON.stringify(
        String(fields.images || '')
          .split('\n')
          .map((value) => value.trim())
          .filter(Boolean),
      ),
    );
    data.set('attributes', JSON.stringify(attributes));
    data.set(
      'variants',
      JSON.stringify(
        variants.map((item) => ({ ...item, price: item.price === '' ? fields.price : item.price })),
      ),
    );
    for (const key of ['active', 'codEnabled', 'backorder']) data.set(key, String(fields[key] === 'on'));
    if (file) data.set('image', file);
    const path = shopPath(slug, `/products${product ? `/${product.id}` : ''}`);
    if (await action.mutate(path, product ? 'PUT' : 'POST', data, 'Product saved.'))
      router.push(workspaceLink('/dashboard/products', slug));
  }
  return (
    <form className="stack-lg" onSubmit={save}>
      <div className="grid-2">
        <section className="surface stack">
          <h2>Product details</h2>
          <Field label="Product name" name="name" defaultValue={product?.name} required />
          <Field label="Description">
            <textarea name="description" defaultValue={product?.description} />
          </Field>
          <div className="fields">
            <Field
              label={`Price (${shop.currency})`}
              name="price"
              type="number"
              step=".01"
              min="0"
              required
              defaultValue={product?.price}
            />
            <Field
              label="Stock"
              name="stock"
              type="number"
              min="0"
              required
              defaultValue={product?.stock ?? 0}
            />
            <Field label="SKU" name="sku" defaultValue={product?.sku} />
            <Field label="Category">
              <input name="category" list="catalog-categories" defaultValue={product?.category} />
              <datalist id="catalog-categories">
                {shop.categories?.map((item) => (
                  <option key={item.id} value={item.name} />
                ))}
              </datalist>
            </Field>
            <Field
              label="Weight (kg)"
              name="weight"
              type="number"
              step=".001"
              min="0"
              defaultValue={product?.weight ?? 0}
            />
            <Field
              label="Low stock alert"
              name="lowStock"
              type="number"
              min="0"
              defaultValue={product?.lowStock ?? 5}
            />
            <Field label="Material" name="material" defaultValue={product?.material} />
            <Field label="Tags, comma separated" name="tags" defaultValue={product?.tags?.join(', ')} />
          </div>
          <div className="row">
            <Toggle name="active" defaultChecked={product?.active !== false}>
              Published
            </Toggle>
            <Toggle name="codEnabled" defaultChecked={product?.codEnabled !== false}>
              Allow COD
            </Toggle>
            <Toggle name="backorder" defaultChecked={product?.backorder}>
              Allow backorders
            </Toggle>
          </div>
        </section>
        <section className="surface stack">
          <h2>Media and search</h2>
          <Field label="Main image URL" name="imageUrl" type="url" defaultValue={product?.imageUrl} />
          <Field label="Additional image URLs" hint="One URL per line.">
            <textarea
              name="images"
              defaultValue={product?.images?.filter((url) => url !== product.imageUrl).join('\n')}
            />
          </Field>
          <Field
            label="Upload an image (optional)"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={(event) => setFile(event.target.files[0])}
          />
          <Field
            label="Video URL"
            hint="Use an HTTPS link to an MP4 or WebM file."
            name="videoUrl"
            type="url"
            defaultValue={product?.videoUrl}
          />
          <Field label="SEO title" name="seoTitle" maxLength={70} defaultValue={product?.seoTitle} />
          <Field label="SEO description">
            <textarea name="seoDescription" maxLength={180} defaultValue={product?.seoDescription} />
          </Field>
        </section>
      </div>
      <section className="surface stack">
        <div className="section-title">
          <div>
            <h2>Attributes and variants</h2>
            <p className="muted fine">
              Create combinations from attributes such as color and size. Each variant has its own price
              and stock.
            </p>
          </div>
          <Button
            tone="secondary"
            disabled={attributes.length >= 12}
            onClick={() => setAttributes([...attributes, { name: '', type: 'select', values: '' }])}
          >
            <FiPlus /> Attribute
          </Button>
        </div>
        {attributes.map((item, index) => (
          <div className="fields fields-3 muted-block" key={index}>
            <Field
              label="Attribute name"
              value={item.name}
              placeholder="Color, size, weight, material…"
              onChange={(event) => changeAttribute(index, 'name', event.target.value)}
            />
            <Field label="Type">
              <select
                value={item.type}
                onChange={(event) => changeAttribute(index, 'type', event.target.value)}
              >
                <option value="text">Text</option>
                <option value="select">Dropdown</option>
                <option value="swatch">Swatch</option>
              </select>
            </Field>
            <Field
              label="Values, comma separated"
              value={Array.isArray(item.values) ? item.values.join(', ') : item.values}
              onChange={(event) => changeAttribute(index, 'values', event.target.value)}
            />
            <div className="field-span">
              <Button
                tone="quiet"
                onClick={() => setAttributes(attributes.filter((_, n) => n !== index))}
              >
                Remove attribute
              </Button>
            </div>
          </div>
        ))}
        <div className="row">
          <Button tone="secondary" disabled={!attributes.length} onClick={generate}>
            Generate combinations
          </Button>
          <Button
            tone="secondary"
            disabled={variants.length >= 80}
            onClick={() =>
              setVariants([
                ...variants,
                { id: crypto.randomUUID(), name: '', sku: '', stock: 0, price: '', imageUrl: '' },
              ])
            }
          >
            Add a variant
          </Button>
        </div>
        {variants.map((item, index) => (
          <div className="fields fields-3 muted-block" key={item.id}>
            <Field
              label="Variant name"
              required
              value={item.name}
              onChange={(event) => changeVariant(index, 'name', event.target.value)}
            />
            <Field
              label="Variant SKU"
              value={item.sku}
              onChange={(event) => changeVariant(index, 'sku', event.target.value)}
            />
            <Field
              label="Variant price"
              type="number"
              step=".01"
              min="0"
              placeholder="Use base price"
              value={item.price}
              onChange={(event) => changeVariant(index, 'price', event.target.value)}
            />
            <Field
              label="Variant stock"
              type="number"
              min="0"
              required
              value={item.stock}
              onChange={(event) => changeVariant(index, 'stock', event.target.value)}
            />
            <Field
              label="Variant image URL"
              type="url"
              value={item.imageUrl || ''}
              onChange={(event) => changeVariant(index, 'imageUrl', event.target.value)}
            />
            <div className="self-end">
              <Button tone="quiet" onClick={() => setVariants(variants.filter((_, n) => n !== index))}>
                Remove variant
              </Button>
            </div>
          </div>
        ))}
      </section>
      <Feedback action={action} />
      <div className="row">
        <Button type="submit" disabled={action.busy}>
          {action.busy ? 'Saving…' : 'Save product'}
        </Button>
        <Button tone="secondary" href={workspaceLink('/dashboard/products', slug)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
export function ProductEditor() {
  const params = useSearchParams(),
    id = params.get('edit');
  const { slug, canManage } = useWorkspace();
  const source = useShopResource(id ? `/products/${encodeURIComponent(id)}?all=1` : null);
  return (
    <>
      <Heading
        eyebrow="Catalog"
        title={id ? 'Edit product' : 'Add a product'}
        description="Set what customers can buy and how much you have in stock."
      />
      <NeedShop>
        {!canManage ? (
          <Notice tone="warn">Your role can view the catalog.</Notice>
        ) : id ? (
          <Resource source={source}>
            {(product) => (
              <ProductFields key={`${slug}:${id}`} product={product} reload={source.reload} />
            )}
          </Resource>
        ) : (
          <ProductFields key={slug} />
        )}
      </NeedShop>
    </>
  );
}
