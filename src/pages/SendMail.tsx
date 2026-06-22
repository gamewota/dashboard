import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Container from '../components/Container';
import { Button } from '../components/Button';
import { useToast } from '../hooks/useToast';
import { useHasPermission } from '../hooks/usePermissions';
import { sendAdminMail, resetInboxState } from '../features/inbox/inboxSlice';
import { fetchUsers } from '../features/users/userSlice';
import { fetchCards } from '../features/cards/cardSlice';
import { fetchGameItems } from '../features/gameItems/gameItemsSlice';
import { fetchCurrencies } from '../features/currencies/currencySlice';
import type { RootState, AppDispatch } from '../store';
import type { MailAttachmentType, RecipientMode, SendMailPayload } from '../lib/schemas/inbox';

const DEFAULT_QUANTITY = 1;

export function SendMail() {
    const dispatch = useDispatch<AppDispatch>();
    const { showToast, ToastContainer } = useToast();
    const canSend = useHasPermission('inbox.send');

    const users = useSelector((s: RootState) => s.users.data);
    const cards = useSelector((s: RootState) => s.cards.data);
    const gameItems = useSelector((s: RootState) => s.gameItems.data);
    const currencies = useSelector((s: RootState) => s.currency.data);
    const { sending, error } = useSelector((s: RootState) => s.inbox);

    const [recipientMode, setRecipientMode] = useState<RecipientMode>('broadcast');
    const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
    const [userSearch, setUserSearch] = useState('');

    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [expiresAt, setExpiresAt] = useState(''); // datetime-local string

    const [hasAttachment, setHasAttachment] = useState(false);
    const [attachType, setAttachType] = useState<MailAttachmentType>('currency');
    const [attachCardId, setAttachCardId] = useState<number | null>(null);
    const [attachItemId, setAttachItemId] = useState<number | null>(null);
    const [attachCurrencyId, setAttachCurrencyId] = useState<number | null>(null);
    const [attachQuantity, setAttachQuantity] = useState(DEFAULT_QUANTITY);
    const [attachAmount, setAttachAmount] = useState(DEFAULT_QUANTITY);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchCards());
        dispatch(fetchGameItems());
        dispatch(fetchCurrencies());
        return () => { dispatch(resetInboxState()); };
    }, [dispatch]);

    const resetAttachment = () => {
        setAttachCardId(null);
        setAttachItemId(null);
        setAttachCurrencyId(null);
        setAttachQuantity(DEFAULT_QUANTITY);
        setAttachAmount(DEFAULT_QUANTITY);
    };

    const handleAttachTypeChange = (type: MailAttachmentType) => {
        setAttachType(type);
        resetAttachment();
    };

    const toggleUser = (id: number) =>
        setSelectedUserIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
        );

    const filteredUsers = users.filter((u) => {
        const q = userSearch.toLowerCase();
        return (
            u.username.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            `${u.first_name} ${u.last_name}`.toLowerCase().includes(q)
        );
    });

    const buildAttachment = (): SendMailPayload['attachment'] => {
        if (!hasAttachment) return null;
        if (attachType === 'card') {
            if (!attachCardId) return null;
            return { type: 'card', card_id: attachCardId, quantity: attachQuantity };
        }
        if (attachType === 'item') {
            if (!attachItemId) return null;
            return { type: 'item', item_id: attachItemId, quantity: attachQuantity };
        }
        if (!attachCurrencyId) return null;
        return { type: 'currency', currency_id: attachCurrencyId, amount: attachAmount };
    };

    const resetForm = () => {
        setRecipientMode('broadcast');
        setSelectedUserIds([]);
        setUserSearch('');
        setTitle('');
        setMessage('');
        setExpiresAt('');
        setHasAttachment(false);
        setAttachType('currency');
        resetAttachment();
    };

    const handleSubmit = async () => {
        if (!title.trim()) { showToast('Title is required', 'error'); return; }
        if (!message.trim()) { showToast('Message is required', 'error'); return; }
        if (recipientMode === 'specific' && selectedUserIds.length === 0) {
            showToast('Please select at least one recipient', 'error');
            return;
        }
        if (hasAttachment) {
            if (attachType === 'card' && !attachCardId) { showToast('Please select a card', 'error'); return; }
            if (attachType === 'item' && !attachItemId) { showToast('Please select an item', 'error'); return; }
            if (attachType === 'currency' && !attachCurrencyId) { showToast('Please select a currency', 'error'); return; }
        }

        // null userIds = broadcast; array = specific recipients
        const payload: SendMailPayload = {
            userIds: recipientMode === 'broadcast' ? null : selectedUserIds,
            title: title.trim(),
            message: message.trim(),
            attachment: buildAttachment(),
            expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        };

        try {
            const result = await dispatch(sendAdminMail(payload)).unwrap();
            const msg = typeof result === 'object' ? result?.message : String(result);
            showToast(msg || 'Mail sent successfully', 'success');
            resetForm();
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : String(err);
            showToast(message || 'Failed to send mail', 'error');
        }
    };

    if (!canSend) {
        return (
            <div className="min-h-screen w-screen flex justify-center items-center">
                <p className="text-error font-semibold">You do not have permission to send admin mail.</p>
            </div>
        );
    }

    return (
        <Container className="flex-col items-center">
            <ToastContainer />
            <div className="w-full max-w-2xl space-y-6">
                <h1 className="text-2xl font-bold">Send Admin Mail</h1>

                {/* ── Recipients ── */}
                <div className="card bg-base-100 shadow p-5 space-y-3">
                    <h2 className="font-semibold text-base">Recipients</h2>
                    <div className="flex gap-6">
                        {(['broadcast', 'specific'] as RecipientMode[]).map((mode) => (
                            <label key={mode} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    className="radio radio-primary"
                                    checked={recipientMode === mode}
                                    onChange={() => { setRecipientMode(mode); setSelectedUserIds([]); }}
                                />
                                <span>
                                    {mode === 'broadcast' ? 'Broadcast (all users)' : 'Specific Users'}
                                </span>
                            </label>
                        ))}
                    </div>

                    {recipientMode === 'specific' && (
                        <div className="space-y-2">
                            <input
                                type="text"
                                className="input input-bordered w-full"
                                placeholder="Search by username, email, or name…"
                                value={userSearch}
                                onChange={(e) => setUserSearch(e.target.value)}
                            />
                            <div className="border border-base-300 rounded-md max-h-48 overflow-y-auto divide-y divide-base-200">
                                {filteredUsers.length === 0 ? (
                                    <p className="p-3 text-sm text-base-content/60">No users found</p>
                                ) : (
                                    filteredUsers.map((u) => (
                                        <label
                                            key={u.user_id}
                                            className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-base-200"
                                        >
                                            <input
                                                type="checkbox"
                                                className="checkbox checkbox-primary checkbox-sm"
                                                checked={selectedUserIds.includes(u.user_id)}
                                                onChange={() => toggleUser(u.user_id)}
                                            />
                                            <span className="text-sm">
                                                <span className="font-medium">{u.username}</span>
                                                <span className="text-base-content/50 ml-2 text-xs">{u.email}</span>
                                            </span>
                                        </label>
                                    ))
                                )}
                            </div>
                            {selectedUserIds.length > 0 && (
                                <p className="text-xs text-base-content/60">{selectedUserIds.length} user(s) selected</p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Title ── */}
                <div className="card bg-base-100 shadow p-5 space-y-2">
                    <h2 className="font-semibold text-base">Title</h2>
                    <input
                        type="text"
                        className="input input-bordered w-full"
                        placeholder="Mail title…"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>

                {/* ── Message ── */}
                <div className="card bg-base-100 shadow p-5 space-y-2">
                    <h2 className="font-semibold text-base">Message</h2>
                    <textarea
                        className="textarea textarea-bordered w-full min-h-32"
                        placeholder="Write your message here…"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* ── Expiry (optional) ── */}
                <div className="card bg-base-100 shadow p-5 space-y-2">
                    <h2 className="font-semibold text-base">
                        Expires At
                        <span className="ml-2 text-xs font-normal text-base-content/50">optional</span>
                    </h2>
                    <input
                        type="datetime-local"
                        className="input input-bordered w-full"
                        value={expiresAt}
                        onChange={(e) => setExpiresAt(e.target.value)}
                    />
                    {expiresAt && (
                        <button
                            className="btn btn-ghost btn-xs self-start"
                            onClick={() => setExpiresAt('')}
                        >
                            Clear
                        </button>
                    )}
                </div>

                {/* ── Attachment (optional reward) ── */}
                <div className="card bg-base-100 shadow p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <h2 className="font-semibold text-base">Attachment</h2>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                className="checkbox checkbox-primary checkbox-sm"
                                checked={hasAttachment}
                                onChange={(e) => {
                                    setHasAttachment(e.target.checked);
                                    if (!e.target.checked) resetAttachment();
                                }}
                            />
                            <span className="text-sm">Include a reward</span>
                        </label>
                    </div>

                    {hasAttachment && (
                        <div className="space-y-4">
                            {/* type selector */}
                            <div className="flex gap-5">
                                {(['card', 'item', 'currency'] as MailAttachmentType[]).map((t) => (
                                    <label key={t} className="flex items-center gap-2 cursor-pointer capitalize">
                                        <input
                                            type="radio"
                                            className="radio radio-secondary radio-sm"
                                            checked={attachType === t}
                                            onChange={() => handleAttachTypeChange(t)}
                                        />
                                        {t}
                                    </label>
                                ))}
                            </div>

                            {/* card */}
                            {attachType === 'card' && (
                                <div className="flex gap-3 items-center">
                                    <select
                                        className="select select-bordered flex-1"
                                        value={attachCardId ?? ''}
                                        onChange={(e) => setAttachCardId(Number(e.target.value) || null)}
                                    >
                                        <option value="">Select a card…</option>
                                        {cards.map((c) => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm">Qty</span>
                                        <input
                                            type="number" min={1}
                                            className="input input-bordered w-24"
                                            value={attachQuantity}
                                            onChange={(e) => setAttachQuantity(Math.max(1, Number(e.target.value)))}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* item */}
                            {attachType === 'item' && (
                                <div className="flex gap-3 items-center">
                                    <select
                                        className="select select-bordered flex-1"
                                        value={attachItemId ?? ''}
                                        onChange={(e) => setAttachItemId(Number(e.target.value) || null)}
                                    >
                                        <option value="">Select an item…</option>
                                        {gameItems.map((i) => (
                                            <option key={i.id} value={i.id}>{i.name}</option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm">Qty</span>
                                        <input
                                            type="number" min={1}
                                            className="input input-bordered w-24"
                                            value={attachQuantity}
                                            onChange={(e) => setAttachQuantity(Math.max(1, Number(e.target.value)))}
                                        />
                                    </label>
                                </div>
                            )}

                            {/* currency */}
                            {attachType === 'currency' && (
                                <div className="flex gap-3 items-center">
                                    <select
                                        className="select select-bordered flex-1"
                                        value={attachCurrencyId ?? ''}
                                        onChange={(e) => setAttachCurrencyId(Number(e.target.value) || null)}
                                    >
                                        <option value="">Select a currency…</option>
                                        {currencies.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}{c.code ? ` (${c.code})` : ''}
                                            </option>
                                        ))}
                                    </select>
                                    <label className="flex items-center gap-2 shrink-0">
                                        <span className="text-sm">Amount</span>
                                        <input
                                            type="number" min={1}
                                            className="input input-bordered w-24"
                                            value={attachAmount}
                                            onChange={(e) => setAttachAmount(Math.max(1, Number(e.target.value)))}
                                        />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Error banner ── */}
                {error && (
                    <div className="alert alert-error text-sm" role="alert">{error}</div>
                )}

                {/* ── Actions ── */}
                <div className="flex justify-end gap-2 pb-10">
                    <Button variant="ghost" onClick={resetForm} disabled={sending}>
                        Reset
                    </Button>
                    <Button variant="primary" onClick={handleSubmit} disabled={sending}>
                        {sending
                            ? <span className="loading loading-spinner loading-sm" />
                            : 'Send Mail'}
                    </Button>
                </div>
            </div>
        </Container>
    );
}

export default SendMail;