'use client';

import { useState } from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';
import { getFields, shopPath } from '@/lib/shopos';
import { Button, Field } from './ui';
import { Feedback, useMutation, useWorkspace } from './workspace';

function ContentItem({ path, item, kind, reload, onSaved }) {
  const action = useMutation(reload);
  const category = kind === 'categories';
  const buttonFields = !category;

  async function save(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (!data.get('image')?.size) data.delete('image');
    if (
      await action.mutate(
        item ? `${path}/${item.id}` : path,
        item ? 'PUT' : 'POST',
        data,
        item ? 'Changes saved.' : 'Item added.',
      )
    ) {
      onSaved?.();
    }
  }

  function remove() {
    if (window.confirm(`Remove ${item.name || item.heading}?`))
      action.mutate(`${path}/${item.id}`, 'DELETE');
  }

  return (
    <form className="muted-block stack" onSubmit={save}>
      <div className="fields">
        <Field
          label={category ? 'Category name' : 'Heading'}
          name={category ? 'name' : 'heading'}
          defaultValue={category ? item?.name : item?.heading}
          maxLength={160}
          required
        />
        <Field label="Image URL" name="imageUrl" type="url" defaultValue={item?.imageUrl} />
        <div className="field-span">
          <Field
            label="Upload an image"
            name="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hint="JPEG, PNG, WebP, or GIF up to 3.5 MB."
          />
        </div>
        {buttonFields && (
          <>
            <div className="field-span">
              <Field label="Description">
                <textarea name="description" maxLength={1600} defaultValue={item?.description} />
              </Field>
            </div>
            <Field label="Button text" name="ctaText" defaultValue={item?.ctaText} />
            <Field
              label="Button link"
              name="ctaLink"
              defaultValue={item?.ctaLink}
              placeholder="/shops/your-store/products"
            />
          </>
        )}
      </div>
      <div className="row">
        <Button type="submit" tone="secondary" disabled={action.busy}>
          {item ? 'Save changes' : 'Add item'}
        </Button>
        {item && (
          <Button tone="danger" disabled={action.busy} onClick={remove}>
            <FiTrash2 /> Remove
          </Button>
        )}
        {!item && (
          <Button tone="quiet" onClick={onSaved}>
            Cancel
          </Button>
        )}
      </div>
      <Feedback action={action} />
    </form>
  );
}

function ContentGroup({ kind, title, items, reload }) {
  const { slug } = useWorkspace();
  const [adding, setAdding] = useState(false);
  const path = shopPath(slug, `/${kind}`);

  return (
    <section className="surface stack">
      <div className="section-title">
        <h2>{title}</h2>
        <Button tone="secondary" disabled={adding} onClick={() => setAdding(true)}>
          <FiPlus /> Add item
        </Button>
      </div>
      {adding && (
        <ContentItem path={path} kind={kind} reload={reload} onSaved={() => setAdding(false)} />
      )}
      {!items.length && !adding && <p className="muted fine">No items added yet.</p>}
      {items.map((item) => (
        <details key={item.id} className="surface disclosure">
          <summary>{item.name || item.heading || 'Untitled'}</summary>
          <ContentItem path={path} item={item} kind={kind} reload={reload} />
        </details>
      ))}
    </section>
  );
}

function StoreFooterForm({ footer, reload }) {
  const { slug } = useWorkspace();
  const action = useMutation(reload);

  async function save(event) {
    event.preventDefault();
    const { facebook, instagram, whatsapp, ...details } = getFields(event.currentTarget);
    await action.mutate(
      shopPath(slug, '/footer'),
      'PUT',
      { ...details, socials: { facebook, instagram, whatsapp } },
      'Store footer saved.',
    );
  }

  return (
    <form className="surface stack" onSubmit={save}>
      <h2>Store footer</h2>
      <div className="fields">
        <div className="field-span">
          <Field label="About your store">
            <textarea name="about" maxLength={1000} defaultValue={footer.about} />
          </Field>
        </div>
        <Field label="Contact email" name="email" type="email" defaultValue={footer.email} />
        <Field label="Contact phone" name="phone" type="tel" defaultValue={footer.phone} />
        <Field label="Contact address" name="address" defaultValue={footer.address} />
        {['Facebook', 'Instagram', 'WhatsApp'].map((label) => (
          <Field
            key={label}
            label={`${label} URL`}
            name={label.toLowerCase()}
            type="url"
            defaultValue={footer.socials?.[label.toLowerCase()]}
          />
        ))}
      </div>
      <div>
        <Button type="submit" disabled={action.busy}>
          Save footer
        </Button>
      </div>
      <Feedback action={action} />
    </form>
  );
}

export function StoreContent({ settings, reload }) {
  return (
    <div id="storefront-content" className="stack-lg">
      <ContentGroup title="Storefront banners" kind="banners" items={settings.banners} reload={reload} />
      <ContentGroup
        title="Product categories"
        kind="categories"
        items={settings.categories}
        reload={reload}
      />
      <ContentGroup
        title="Storefront sections"
        kind="static-sections"
        items={settings.staticSections}
        reload={reload}
      />
      <StoreFooterForm footer={settings.footer} reload={reload} />
    </div>
  );
}
