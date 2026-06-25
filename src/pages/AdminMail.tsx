import { useState, useEffect } from 'react';
import type { SubmitEventHandler } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Container from '../components/Container';
import { sendAdminMail, resetInboxState } from '../features/inbox/inboxSlice';
import { fetchUsers } from '../features/users/userSlice';
import { fetchCards } from '../features/cards/cardSlice';
import { fetchGameItems } from '../features/gameItems/gameItemsSlice'; // ← was fetchShopItems
import { fetchCurrencies } from '../features/currencies/currencySlice';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { useHasPermission } from '../hooks/usePermissions';
import type { RecipientMode, SendMailPayload, MailAttachmentType } from '../lib/schemas/inbox';
import { SearchableSelect } from '../components/SearchableSelect';

type AttachmentFieldType = 'none' | MailAttachmentType;

interface FormState {
    recipientMode: RecipientMode;
    selectedUserIds: number[];
    title: string;
    message: string;
    attachmentType: AttachmentFieldType;
    attachmentContentId: number | null;
    attachmentQuantity: string;
    expiresAt: string;
}

const INITIAL_FORM: FormState = {
    recipientMode: 'broadcast',
    selectedUserIds: [],
    title: '',
    message: '',
    attachmentType: 'none',
    attachmentContentId: null,
    attachmentQuantity: '',
    expiresAt: '',
};

export function AdminMail() {
    const dispatch = useDispatch<AppDispatch>();
    const { sending, error: sendError, lastSentAt } = useSelector((state: RootState) => state.inbox);
    const { data: users, loading: usersLoading } = useSelector((state: RootState) => state.users);
    const { data: cards, loading: cardsLoading } = useSelector((state: RootState) => state.cards);
    const { data: gameItems, loading: gameItemsLoading } = useSelector((state: RootState) => state.gameItems); // ← was shopItems
    const { data: currencies, loading: currenciesLoading } = useSelector((state: RootState) => state.currency);
    const { showToast, ToastContainer } = useToast();
    const canSend = useHasPermission('inbox.send');

    const [form, setForm] = useState<FormState>(INITIAL_FORM);

    useEffect(() => {
        dispatch(fetchUsers());
        dispatch(fetchCards());
        dispatch(fetchGameItems()); // ← was fetchShopItems
        dispatch(fetchCurrencies());
    }, [dispatch]);

    useEffect(() => {
        if (lastSentAt) {
            showToast('Mail sent successfully!', 'success');
            setForm(INITIAL_FORM);
            dispatch(resetInboxState());
        }
    }, [lastSentAt, showToast, dispatch]);

    useEffect(() => {
        if (sendError) {
            showToast(sendError, 'error');
            dispatch(resetInboxState());
        }
    }, [sendError, showToast, dispatch]);

    const attachmentOptions = () => {
        switch (form.attachmentType) {
            case 'card':
                return cards.map(c => ({ value: c.id, label: c.name }));
            case 'item':
                return gameItems.map(i => ({ value: i.id, label: i.name })); // ← was shopItems
            case 'currency':
                return currencies.map(c => ({ value: c.id, label: c.code ? `${c.name} (${c.code})` : c.name }));
            default:
                return [];
        }
    };

    const attachmentLoading = (): boolean => {
        switch (form.attachmentType) {
            case 'card': return cardsLoading;
            case 'item': return gameItemsLoading; // ← was shopItemsLoading
            case 'currency': return currenciesLoading;
            default: return false;
        }
    };

    const buildPayload = (): SendMailPayload | null => {
        if (!form.title.trim()) { showToast('Title is required.', 'error'); return null; }
        if (!form.message.trim()) { showToast('Message is required.', 'error'); return null; }

        let userIds: number[] | null = null;
        if (form.recipientMode === 'specific') {
            if (form.selectedUserIds.length === 0) {
                showToast('Please select at least one user.', 'error');
                return null;
            }
            userIds = form.selectedUserIds;
        }

        let attachment: SendMailPayload['attachment'] = null;
        if (form.attachmentType !== 'none') {
            if (form.attachmentContentId === null) {
                showToast('Please select an attachment item.', 'error');
                return null;
            }
            const quantity = parseInt(form.attachmentQuantity, 10);
            if (!quantity || quantity <= 0) {
                showToast('Quantity must be greater than 0.', 'error');
                return null;
            }
            attachment = {
                type: form.attachmentType,
                contentId: form.attachmentContentId,
                quantity,
            };
        }

        return {
            userIds,
            title: form.title.trim(),
            message: form.message.trim(),
            attachment,
            expiresAt: form.expiresAt || null,
        };
    };

    const handleSubmit: SubmitEventHandler<HTMLFormElement> = event => {
        event.preventDefault();
        const payload = buildPayload();
        if (!payload) return;
        dispatch(sendAdminMail(payload));
    };

    if (!canSend) {
        return (
            <Container>
                <div className="alert alert-error w-full max-w-xl">
                    <span>You do not have permission to send admin mail.</span>
                </div>
            </Container>
        );
    }

    return (
        <Container>
            <ToastContainer />
            <div className="w-full max-w-2xl">
                <h1 className="text-2xl font-semibold mb-6">Send Admin Mail</h1>

                <form onSubmit={handleSubmit} className="card bg-base-100 shadow p-6 flex flex-col gap-5">

                    {/* Recipient mode */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Recipient Mode</span>
                        </label>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="recipientMode"
                                    className="radio radio-primary"
                                    checked={form.recipientMode === 'broadcast'}
                                    onChange={() => setForm(f => ({ ...f, recipientMode: 'broadcast', selectedUserIds: [] }))}
                                />
                                <span className="label-text">Broadcast (all users)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="recipientMode"
                                    className="radio radio-primary"
                                    checked={form.recipientMode === 'specific'}
                                    onChange={() => setForm(f => ({ ...f, recipientMode: 'specific' }))}
                                />
                                <span className="label-text">Specific users</span>
                            </label>
                        </div>
                    </div>

                    {/* User multi-select */}
                    {form.recipientMode === 'specific' && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text font-medium">
                                    Recipients <span className="text-error">*</span>
                                </span>
                                <span className="label-text-alt text-base-content/50">
                                    {form.selectedUserIds.length} selected
                                </span>
                            </label>
                            <SearchableSelect
                                multi
                                options={users.map(u => ({
                                    value: u.user_id,
                                    label: `${u.username} — ${u.email}`,
                                }))}
                                value={form.selectedUserIds}
                                onChange={ids => setForm(f => ({ ...f, selectedUserIds: ids }))}
                                placeholder="Search users…"
                                loading={usersLoading}
                            />
                        </div>
                    )}

                    {/* Title */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Title <span className="text-error">*</span>
                            </span>
                        </label>
                        <input
                            type="text"
                            className="input input-bordered w-full"
                            placeholder="Mail title"
                            value={form.title}
                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Message */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">
                                Message <span className="text-error">*</span>
                            </span>
                        </label>
                        <textarea
                            className="textarea textarea-bordered w-full min-h-32"
                            placeholder="Mail message body"
                            value={form.message}
                            onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                            required
                        />
                    </div>

                    {/* Attachment type */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Attachment (optional)</span>
                        </label>
                        <select
                            className="select select-bordered w-full"
                            value={form.attachmentType}
                            onChange={e =>
                                setForm(f => ({
                                    ...f,
                                    attachmentType: e.target.value as AttachmentFieldType,
                                    attachmentContentId: null,
                                    attachmentQuantity: '',
                                }))
                            }
                        >
                            <option value="none">No attachment</option>
                            <option value="card">Card</option>
                            <option value="item">Item</option>
                            <option value="currency">Currency</option>
                        </select>
                    </div>

                    {/* Attachment content + quantity */}
                    {form.attachmentType !== 'none' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">
                                        {form.attachmentType === 'card' ? 'Card' : form.attachmentType === 'item' ? 'Item' : 'Currency'}
                                        <span className="text-error"> *</span>
                                    </span>
                                </label>
                                <SearchableSelect
                                    options={attachmentOptions()}
                                    value={form.attachmentContentId}
                                    onChange={v => setForm(f => ({ ...f, attachmentContentId: v }))}
                                    placeholder={`Search ${form.attachmentType}s…`}
                                    loading={attachmentLoading()}
                                />
                            </div>
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text font-medium">
                                        Quantity <span className="text-error">*</span>
                                    </span>
                                </label>
                                <input
                                    type="number"
                                    className="input input-bordered w-full"
                                    placeholder="Quantity"
                                    min={1}
                                    value={form.attachmentQuantity}
                                    onChange={e => setForm(f => ({ ...f, attachmentQuantity: e.target.value }))}
                                    required
                                />
                            </div>
                        </div>
                    )}

                    {/* Expires At */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text font-medium">Expires At (optional)</span>
                        </label>
                        <input
                            type="datetime-local"
                            className="input input-bordered w-full"
                            value={form.expiresAt}
                            onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                        />
                    </div>

                    {/* Submit */}
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="btn btn-primary" disabled={sending}>
                            {sending && <span className="loading loading-spinner loading-sm mr-1" />}
                            {sending ? 'Sending…' : 'Send Mail'}
                        </button>
                    </div>
                </form>
            </div>
        </Container>
    );
}

export default AdminMail;