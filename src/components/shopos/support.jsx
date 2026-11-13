'use client';

import { useState } from 'react';
import { FiHelpCircle, FiPlus, FiSend } from 'react-icons/fi';
import { Button, Empty, Field, Heading, Status } from './ui';
import {
  Feedback,
  NeedShop,
  Resource,
  useMutation,
  useResource,
  useShopResource,
  useWorkspace,
} from './workspace';
import { dateLabel, getFields, shopPath } from '@/lib/shopos';

export function TicketList({ tickets, admin = false, path, reload }) {
  const [expanded, setExpanded] = useState(null);
  const action = useMutation(reload);
  async function reply(event, item) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(`${path}/${item.id}/reply`, 'POST', getFields(form), 'Ticket updated.'))
      form.reset();
  }
  return (
    <div className="stack">
      <Feedback action={action} />
      {tickets.length ? (
        tickets.map((item) => (
          <article className="muted-block stack" key={item.id}>
            <button
              className="row between w-full text-left"
              type="button"
              aria-expanded={expanded === item.id}
              onClick={() => setExpanded(expanded === item.id ? null : item.id)}
            >
              <div>
                <strong>{item.title}</strong>
                <small className="block">
                  {admin ? `${item.shopSlug} · ` : ''}
                  {dateLabel(item.updatedAt)}
                </small>
              </div>
              <Status value={item.status} />
            </button>
            {expanded === item.id && (
              <>
                <div className="stack">
                  {item.messages.map((message, index) => (
                    <div className="surface" key={index}>
                      <strong>{message.from}</strong>
                      <small className="ml-2">{dateLabel(message.at)}</small>
                      <p className="mt-2 whitespace-pre-wrap break">{message.body}</p>
                    </div>
                  ))}
                </div>
                {(item.status === 'open' || admin) && (
                  <form className="stack" onSubmit={(event) => reply(event, item)}>
                    <Field label="Reply">
                      <textarea name="body" required={!admin} maxLength={2200} />
                    </Field>
                    {admin && (
                      <Field label="Ticket status">
                        <select name="status" defaultValue={item.status}>
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                        </select>
                      </Field>
                    )}
                    <div>
                      <Button type="submit" disabled={action.busy}>
                        <FiSend /> {admin ? 'Update ticket' : 'Send reply'}
                      </Button>
                    </div>
                  </form>
                )}
              </>
            )}
          </article>
        ))
      ) : (
        <Empty icon={FiHelpCircle} title="No support tickets" />
      )}
    </div>
  );
}
export function Support() {
  const { slug } = useWorkspace();
  const source = useShopResource('/tickets'),
    action = useMutation(source.reload),
    path = shopPath(slug, '/tickets');
  async function submit(event) {
    event.preventDefault();
    const form = event.currentTarget;
    if (await action.mutate(path, 'POST', getFields(form), 'Ticket opened.')) form.reset();
  }
  return (
    <>
      <Heading
        eyebrow="Help"
        title="Support"
        description="Send a question to the ShopOS team and see replies here."
      />
      <NeedShop>
        <div className="stack-lg">
          <section className="surface stack">
            <h2>Open a ticket</h2>
            <form className="stack" onSubmit={submit}>
              <Field label="Subject" name="title" required />
              <Field label="Message">
                <textarea name="body" maxLength={2200} required />
              </Field>
              <div>
                <Button type="submit" disabled={action.busy}>
                  <FiPlus /> Open ticket
                </Button>
              </div>
            </form>
            <Feedback action={action} />
          </section>
          <section className="surface stack">
            <h2>Your tickets</h2>
            <Resource source={source}>
              {(items) => <TicketList tickets={items} path={path} reload={source.reload} />}
            </Resource>
          </section>
        </div>
      </NeedShop>
    </>
  );
}
export function AdminTickets() {
  const source = useResource('/admin/tickets');
  return (
    <section className="surface stack">
      <h2>Support inbox</h2>
      <Resource source={source}>
        {(items) => <TicketList tickets={items} admin path="/admin/tickets" reload={source.reload} />}
      </Resource>
    </section>
  );
}
