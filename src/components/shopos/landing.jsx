'use client';

import { useEffect, useState } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import {
  FiArrowDown,
  FiArrowLeft,
  FiArrowUp,
  FiCopy,
  FiExternalLink,
  FiEye,
  FiGlobe,
  FiLayers,
  FiMenu,
  FiPlus,
  FiSave,
  FiTrash2,
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
  Toggle,
} from './ui';
import { Feedback, NeedShop, Resource, useMutation, useShopResource, useWorkspace } from './workspace';
import { dateLabel, getFields, money, shopPath, slugify, workspaceLink } from '@/lib/shopos';

const types = {
  hero: 'Hero',
  features: 'Features',
  testimonials: 'Testimonials',
  countdown: 'Countdown',
  faq: 'FAQ',
  order: 'Order form',
};
const templates = { cod: 'Quick order', launch: 'Product launch', story: 'Product story' };
export function LandingSections({ sections, product, currency, order }) {
  const [time, setTime] = useState(null);
  const hasCountdown = sections.some((item) => item.type === 'countdown' && item.endsAt);
  useEffect(() => {
    if (!hasCountdown) return undefined;
    const timer = setInterval(() => setTime(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [hasCountdown]);
  return (
    <div className="landing-sections">
      {sections.map((section) => {
        if (section.type === 'hero')
          return (
            <section key={section.id} className="landing-hero">
              <div>
                <h2>{section.title || product.name}</h2>
                {section.body && <p>{section.body}</p>}
                {order && (
                  <a href="#order" className="button button-lime">
                    Buy now
                  </a>
                )}
              </div>
              <ProductImage
                src={section.image || product.imageUrl}
                alt={section.title || product.name}
                priority
              />
            </section>
          );
        if (section.type === 'order')
          return (
            <section className="landing-block" key={section.id} id={order ? 'order' : undefined}>
              <h2>{section.title || 'Order this product'}</h2>
              {section.body && <p className="muted">{section.body}</p>}
              {order || (
                <div className="muted-block">
                  <strong>{product.name}</strong>
                  <p>{money(product.price, currency)}</p>
                  <span className="button button-primary mt-3">Place order</span>
                </div>
              )}
            </section>
          );
        if (section.type === 'countdown') {
          const remaining =
            time === null || !section.endsAt
              ? null
              : Math.max(0, new Date(section.endsAt).getTime() - time);
          const seconds = remaining === null ? null : Math.floor(remaining / 1000);
          const blocks =
            seconds === null
              ? []
              : [
                  Math.floor(seconds / 86400),
                  Math.floor(seconds / 3600) % 24,
                  Math.floor(seconds / 60) % 60,
                  seconds % 60,
                ];
          return (
            <section key={section.id} className="landing-block landing-countdown">
              <h2>{section.title || 'Offer countdown'}</h2>
              {section.body && <p>{section.body}</p>}
              {!section.endsAt ? (
                <p className="fine muted">Set an end date in the editor.</p>
              ) : remaining === 0 ? (
                <strong>Offer ended</strong>
              ) : (
                <>
                  <time dateTime={section.endsAt}>Ends {dateLabel(section.endsAt)}</time>
                  <div className="row" aria-hidden="true">
                    {blocks.map((value, index) => (
                      <div key={index}>
                        <strong>{String(value).padStart(2, '0')}</strong>
                        <small>{['Days', 'Hours', 'Minutes', 'Seconds'][index]}</small>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          );
        }
        return (
          <section key={section.id} className="landing-block">
            <h2>{section.title || types[section.type]}</h2>
            {section.body && <p className="muted">{section.body}</p>}
            {section.image && <ProductImage src={section.image} alt={section.title} />}
            <div className={section.type === 'faq' ? 'stack' : 'grid-2'}>
              {section.items?.map((entry, index) =>
                section.type === 'faq' ? (
                  <details key={index} className="muted-block">
                    <summary className="font-bold cursor-pointer">{entry.title}</summary>
                    <p className="muted mt-2">{entry.body}</p>
                  </details>
                ) : (
                  <div className="muted-block" key={index}>
                    <h3>{entry.title}</h3>
                    <p className="muted mt-2">{entry.body}</p>
                  </div>
                ),
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
function SortableSection({ id, label, active, index, total, select, move }) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className={`builder-sort${active ? ' is-selected' : ''}`}
    >
      <button
        className="drag-grip"
        type="button"
        title="Drag section"
        aria-label={`Drag ${label}`}
        tabIndex={-1}
        onPointerDown={(event) => controls.start(event)}
      >
        <FiMenu />
      </button>
      <button type="button" className="sort-label" aria-pressed={active} onClick={select}>
        {label}
      </button>
      <div className="row sort-arrows">
        <IconButton
          icon={FiArrowUp}
          label={`Move ${label} up`}
          disabled={index === 0}
          onClick={() => move(-1)}
        />
        <IconButton
          icon={FiArrowDown}
          label={`Move ${label} down`}
          disabled={index === total - 1}
          onClick={() => move(1)}
        />
      </div>
    </Reorder.Item>
  );
}
function SectionForm({ item, change, remove, canRemove }) {
  function patchLine(index, key, value) {
    change(
      'items',
      item.items.map((entry, n) => (n === index ? { ...entry, [key]: value } : entry)),
    );
  }
  return (
    <div className="stack muted-block">
      <div className="row between">
        <h3>{types[item.type]} section</h3>
        {canRemove && <IconButton label="Remove section" icon={FiTrash2} onClick={remove} />}
      </div>
      <Field
        label="Heading"
        value={item.title}
        onChange={(event) => change('title', event.target.value)}
      />
      <Field label="Text">
        <textarea value={item.body || ''} onChange={(event) => change('body', event.target.value)} />
      </Field>
      {item.type !== 'order' && (
        <Field
          label="Image URL"
          type="url"
          value={item.image || ''}
          onChange={(event) => change('image', event.target.value)}
        />
      )}
      {item.type === 'countdown' && (
        <Field
          label="Ends at"
          type="datetime-local"
          value={item.endsAt?.slice(0, 16) || ''}
          onChange={(event) =>
            change('endsAt', event.target.value ? new Date(event.target.value).toISOString() : null)
          }
        />
      )}
      {['features', 'faq', 'testimonials'].includes(item.type) && (
        <>
          <div className="row between">
            <span className="label-text">Entries</span>
            <Button
              tone="secondary"
              onClick={() => change('items', [...(item.items || []), { title: '', body: '' }])}
              disabled={(item.items || []).length >= 15}
            >
              <FiPlus /> Add entry
            </Button>
          </div>
          {item.items?.map((entry, index) => (
            <div className="stack muted-block" key={index}>
              <Field
                label={item.type === 'faq' ? 'Question' : 'Title'}
                value={entry.title}
                onChange={(event) => patchLine(index, 'title', event.target.value)}
              />
              <Field label={item.type === 'faq' ? 'Answer' : 'Description'}>
                <textarea
                  value={entry.body}
                  onChange={(event) => patchLine(index, 'body', event.target.value)}
                />
              </Field>
              <div>
                <Button
                  tone="quiet"
                  onClick={() =>
                    change(
                      'items',
                      item.items.filter((_, n) => n !== index),
                    )
                  }
                >
                  Remove entry
                </Button>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
function Builder({ initial, products, close, reload }) {
  const { slug, shop } = useWorkspace();
  const [page, setPage] = useState(initial),
    [variant, setVariant] = useState('a'),
    [selected, setSelected] = useState(initial.variants.a[0]?.id),
    [add, setAdd] = useState('features'),
    [previewWidth, setPreviewWidth] = useState('desktop');
  const action = useMutation();
  const sections = page.variants[variant];
  const active = sections.find((item) => item.id === selected) || sections[0];
  const product = products.find((item) => item.id === page.productId) || { name: page.title, price: 0 };
  const pagePath = shopPath(slug, `/landings/${page.id}`);
  function sectionsChange(next) {
    setPage((value) => ({ ...value, variants: { ...value.variants, [variant]: next } }));
  }
  function move(index, offset) {
    const next = [...sections];
    [next[index], next[index + offset]] = [next[index + offset], next[index]];
    sectionsChange(next);
  }
  async function save(publish, unpublish = false) {
    const result = await action.mutate(
      pagePath,
      'PUT',
      { ...page, publish, unpublish },
      publish ? 'Page published.' : unpublish ? 'Page unpublished.' : 'Draft saved.',
    );
    if (result) {
      setPage(result);
      reload();
    }
  }
  return (
    <>
      <Heading
        eyebrow="Landing page builder"
        title={page.title}
        description="Edit the draft, preview it at different widths, and publish when ready."
        actions={
          <>
            <Button tone="quiet" onClick={close}>
              <FiArrowLeft /> All pages
            </Button>
            {page.status === 'published' && (
              <Button tone="secondary" href={shopPath(slug, `/p/${page.slug}`)}>
                <FiExternalLink /> Live page
              </Button>
            )}
            <Button tone="secondary" disabled={action.busy} onClick={() => save(false)}>
              <FiSave /> Save draft
            </Button>
            <Button disabled={action.busy} onClick={() => save(true)}>
              <FiGlobe /> Publish
            </Button>
          </>
        }
      />
      <Feedback action={action} />
      <div className="builder-layout">
        <section className="surface stack">
          <div className="row between">
            <h2>Page settings</h2>
            <Status value={page.status} />
          </div>
          <Field
            label="Page title"
            value={page.title}
            onChange={(event) => setPage({ ...page, title: event.target.value })}
          />
          <Field
            label="URL slug"
            value={page.slug}
            readOnly={!!page.published}
            onChange={(event) => setPage({ ...page, slug: slugify(event.target.value) })}
          />
          <Field label="Featured product">
            <select
              value={page.productId}
              onChange={(event) => setPage({ ...page, productId: event.target.value })}
            >
              {products.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </Field>
          <details>
            <summary className="font-bold cursor-pointer">SEO settings</summary>
            <div className="stack mt-3">
              <Field
                label="SEO title"
                value={page.seoTitle || ''}
                maxLength={70}
                onChange={(event) => setPage({ ...page, seoTitle: event.target.value })}
              />
              <Field label="SEO description">
                <textarea
                  maxLength={180}
                  value={page.seoDescription || ''}
                  onChange={(event) => setPage({ ...page, seoDescription: event.target.value })}
                />
              </Field>
            </div>
          </details>
          <hr className="thin-rule" />
          <Toggle
            checked={page.abEnabled}
            onChange={(event) => setPage({ ...page, abEnabled: event.target.checked })}
          >
            Run an A/B test
          </Toggle>
          <div className="pill-tabs" aria-label="Page variant">
            {['a', 'b'].map((id) => (
              <button
                type="button"
                key={id}
                aria-pressed={variant === id}
                onClick={() => {
                  setVariant(id);
                  setSelected(page.variants[id][0]?.id);
                }}
              >
                Variant {id.toUpperCase()}
              </button>
            ))}
          </div>
          {page.abEnabled && (
            <Field
              label="Traffic to variant B (%)"
              type="number"
              min="1"
              max="99"
              value={page.split}
              onChange={(event) => setPage({ ...page, split: event.target.value })}
            />
          )}
          {variant === 'b' && (
            <Button
              tone="secondary"
              onClick={() =>
                sectionsChange(page.variants.a.map((item) => ({ ...item, id: crypto.randomUUID() })))
              }
            >
              <FiCopy /> Copy variant A
            </Button>
          )}
          <h2>Page sections</h2>
          <Reorder.Group
            as="ol"
            axis="y"
            values={sections.map((item) => item.id)}
            onReorder={(ids) => sectionsChange(ids.map((id) => sections.find((item) => item.id === id)))}
            className="builder-sort-list"
          >
            {sections.map((item, index) => (
              <SortableSection
                key={item.id}
                id={item.id}
                label={types[item.type]}
                active={active?.id === item.id}
                index={index}
                total={sections.length}
                select={() => setSelected(item.id)}
                move={(offset) => move(index, offset)}
              />
            ))}
          </Reorder.Group>
          <div className="row flex-nowrap">
            <select
              className="standalone-select"
              aria-label="Section type"
              value={add}
              onChange={(event) => setAdd(event.target.value)}
            >
              {Object.entries(types).map(([key, label]) => (
                <option value={key} key={key}>
                  {label}
                </option>
              ))}
            </select>
            <Button
              tone="secondary"
              disabled={sections.length >= 18}
              onClick={() => {
                const id = crypto.randomUUID();
                sectionsChange([...sections, { id, type: add, title: types[add], body: '', items: [] }]);
                setSelected(id);
              }}
            >
              <FiPlus /> Add
            </Button>
          </div>
          {active && (
            <SectionForm
              item={active}
              canRemove={sections.length > 1}
              change={(key, value) =>
                sectionsChange(
                  sections.map((item) => (item.id === active.id ? { ...item, [key]: value } : item)),
                )
              }
              remove={() => sectionsChange(sections.filter((item) => item.id !== active.id))}
            />
          )}
          {page.status === 'published' && (
            <div>
              <Button tone="danger" disabled={action.busy} onClick={() => save(false, true)}>
                Unpublish page
              </Button>
            </div>
          )}
        </section>
        <section className="surface builder-preview">
          <div className="section-title">
            <h2>
              <FiEye className="inline mr-2" />
              Preview
            </h2>
            <div className="pill-tabs" aria-label="Preview width">
              {['desktop', 'mobile'].map((width) => (
                <button
                  type="button"
                  key={width}
                  aria-pressed={width === previewWidth}
                  onClick={() => setPreviewWidth(width)}
                >
                  {width}
                </button>
              ))}
            </div>
          </div>
          <div className={`builder-canvas ${previewWidth}`}>
            <LandingSections sections={sections} product={product} currency={shop.currency} />
          </div>
        </section>
      </div>
    </>
  );
}
export function LandingWorkspace() {
  const { slug, canManage } = useWorkspace();
  const pages = useShopResource('/landings'),
    products = useShopResource('/products?all=1&limit=300');
  const [editor, setEditor] = useState(null);
  const action = useMutation(pages.reload);
  async function create(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = getFields(form);
    data.slug ||= slugify(data.title);
    const result = await action.mutate(shopPath(slug, '/landings'), 'POST', data);
    if (result) {
      setEditor(result);
      form.reset();
    }
  }
  if (editor?.shopSlug === slug && products.data && canManage)
    return (
      <Builder
        key={`${slug}:${editor.id}`}
        initial={editor}
        products={products.data}
        close={() => setEditor(null)}
        reload={pages.reload}
      />
    );
  return (
    <>
      <Heading
        eyebrow="Growth"
        title="Landing pages"
        description="Build a campaign page around one product and see how each version performs."
      />
      <NeedShop>
        <div className="stack-lg">
          {canManage && (
            <section className="surface stack">
              <h2>Create a landing page</h2>
              <Resource source={products}>
                {(items) =>
                  items.length ? (
                    <form className="fields fields-3" onSubmit={create}>
                      <Field label="Page title" name="title" required />
                      <Field label="Featured product">
                        <select name="productId" required>
                          {items.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Template">
                        <select name="template">
                          {Object.entries(templates).map(([key, value]) => (
                            <option key={key} value={key}>
                              {value}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <div className="field-span">
                        <Button type="submit" disabled={action.busy}>
                          <FiPlus /> Create page
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <Notice>
                      Add a product before creating a landing page.{' '}
                      <a className="underline" href={workspaceLink('/dashboard/products/new', slug)}>
                        Add a product
                      </a>
                    </Notice>
                  )
                }
              </Resource>
              <Feedback action={action} />
            </section>
          )}
          <Resource source={pages}>
            {(items) =>
              items.length ? (
                <div className="grid-3">
                  {items.map((item) => (
                    <Rise key={item.id} className="surface stack">
                      <span className="feature-icon">
                        <FiLayers />
                      </span>
                      <h3>{item.title}</h3>
                      <div className="row">
                        <Status value={item.status} />
                        {item.abEnabled && <span className="fine muted">A/B enabled</span>}
                      </div>
                      <p className="muted fine">Updated {dateLabel(item.updatedAt)}</p>
                      <div className="row">
                        {canManage && (
                          <Button tone="secondary" onClick={() => setEditor(item)}>
                            Edit
                          </Button>
                        )}
                        {item.status === 'published' && (
                          <Button tone="quiet" href={shopPath(slug, `/p/${item.slug}`)}>
                            View live <FiExternalLink />
                          </Button>
                        )}
                        {canManage && (
                          <IconButton
                            icon={FiTrash2}
                            label={`Delete ${item.title}`}
                            onClick={() => {
                              if (window.confirm(`Delete ${item.title}?`))
                                action.mutate(
                                  shopPath(slug, `/landings/${item.id}`),
                                  'DELETE',
                                  undefined,
                                  'Page deleted.',
                                );
                            }}
                          />
                        )}
                      </div>
                    </Rise>
                  ))}
                </div>
              ) : (
                <section className="surface">
                  <Empty
                    title="No landing pages yet"
                    description="Choose a product and template to open the editor."
                  />
                </section>
              )
            }
          </Resource>
        </div>
      </NeedShop>
    </>
  );
}
