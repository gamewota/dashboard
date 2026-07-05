import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import moment from 'moment';
import Container from '../components/Container';
import {
    fetchBundleStatus,
    triggerBundleBuild,
    resetBundleError,
} from '../features/bundle/bundleSlice';
import type { RootState, AppDispatch } from '../store';
import { useToast } from '../hooks/useToast';
import { useHasPermission } from '../hooks/usePermissions';

const POLL_INTERVAL_MS = 3000;

function formatDate(value: string | null): string {
    if (!value) return '—';
    const parsed = moment(value);
    return parsed.isValid() ? parsed.format('DD MMM YYYY, HH:mm') : value;
}

export function Bundle() {
    const dispatch = useDispatch<AppDispatch>();
    const { status, loading, triggering, error } = useSelector((state: RootState) => state.bundle);
    const { showToast, ToastContainer } = useToast();
    const canTrigger = useHasPermission('bundle.trigger');

    const inProgress = status?.in_progress ?? false;
    const wasInProgress = useRef(false);

    useEffect(() => {
        dispatch(fetchBundleStatus());
    }, [dispatch]);

    // Poll while a build is in progress; stop once it settles.
    useEffect(() => {
        if (!inProgress) return;
        const id = window.setInterval(() => {
            dispatch(fetchBundleStatus());
        }, POLL_INTERVAL_MS);
        return () => window.clearInterval(id);
    }, [inProgress, dispatch]);

    // Toast when a build finishes (in_progress goes true -> false).
    useEffect(() => {
        if (wasInProgress.current && !inProgress && status) {
            showToast('Bundle build finished.', 'success');
        }
        wasInProgress.current = inProgress;
    }, [inProgress, status, showToast]);

    useEffect(() => {
        if (error) {
            showToast(error, 'error');
            dispatch(resetBundleError());
        }
    }, [error, showToast, dispatch]);

    const handleTrigger = async () => {
        const result = await dispatch(triggerBundleBuild());
        if (triggerBundleBuild.fulfilled.match(result)) {
            showToast(result.payload.message ?? 'Bundle build started', 'success');
            dispatch(fetchBundleStatus());
        }
    };

    if (!canTrigger) {
        return (
            <Container>
                <div className="alert alert-error w-full max-w-xl">
                    <span>You do not have permission to manage the asset bundle.</span>
                </div>
            </Container>
        );
    }

    const isDirty = status?.is_dirty ?? false;
    const triggerDisabled = triggering || inProgress || loading;

    return (
        <Container className="flex-col items-center">
            <ToastContainer />
            <div className="w-full max-w-2xl">
                <h1 className="text-2xl font-semibold mb-1">Asset Bundle</h1>

                <div className="card bg-base-100 shadow p-6 flex flex-col gap-5">
                    <div className="flex items-center gap-2 flex-wrap">
                        {inProgress ? (
                            <span className="badge badge-info gap-2">
                                <span className="loading loading-spinner loading-xs" />
                                Build in progress
                            </span>
                        ) : isDirty ? (
                            <span className="badge badge-warning">Changes pending — rebuild needed</span>
                        ) : (
                            <span className="badge badge-success">Up to date</span>
                        )}
                        {loading && !inProgress && (
                            <span className="text-sm text-base-content/50">Refreshing…</span>
                        )}
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                        <div>
                            <dt className="text-base-content/50">Bundle version</dt>
                            <dd className="font-medium">{status?.bundle_version ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-base-content/50">Manifest MD5</dt>
                            <dd className="font-mono text-xs break-all">{status?.manifest_md5 ?? '—'}</dd>
                        </div>
                        <div>
                            <dt className="text-base-content/50">Last built</dt>
                            <dd className="font-medium">{formatDate(status?.last_built_at ?? null)}</dd>
                        </div>
                        <div>
                            <dt className="text-base-content/50">Last edit</dt>
                            <dd className="font-medium">{formatDate(status?.last_edit_at ?? null)}</dd>
                        </div>
                        <div className="sm:col-span-2">
                            <dt className="text-base-content/50">Archive</dt>
                            <dd>
                                {status?.archive_url ? (
                                    <a
                                        href={status.archive_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="link link-primary break-all text-xs"
                                    >
                                        {status.archive_url}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </dd>
                        </div>
                    </dl>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={handleTrigger}
                            disabled={triggerDisabled}
                        >
                            {triggering ? (
                                <>
                                    <span className="loading loading-spinner loading-sm" />
                                    Starting…
                                </>
                            ) : inProgress ? (
                                'Build running…'
                            ) : (
                                'Trigger build'
                            )}
                        </button>
                        <button
                            type="button"
                            className="btn btn-ghost"
                            onClick={() => dispatch(fetchBundleStatus())}
                            disabled={loading}
                        >
                            Refresh
                        </button>
                    </div>
                </div>
            </div>
        </Container>
    );
}

export default Bundle;
