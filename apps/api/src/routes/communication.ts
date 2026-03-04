import { Hono } from 'hono'
import { pool } from '../lib/db'
// @ts-ignore
import { requireAuth } from '../middleware/auth'
import { CommunicationRepository } from '../repositories/communication-repository'

export const communicationRoutes = new Hono()

// Require Auth for all chat endpoints
communicationRoutes.use('*', requireAuth)

// Get or create a thread for a specific screening
communicationRoutes.post('/screenings/:screeningId/thread', async (c) => {
    const screeningId = c.req.param('screeningId')
    const user = c.get('user')
    const body = await c.req.json().catch(() => ({}))

    const commRepo = new CommunicationRepository(pool)
    const canAccess = await commRepo.canAccessScreeningThread(screeningId, user.id)
    if (!canAccess) {
        return c.json({ error: 'Forbidden for this screening' }, 403)
    }

    const thread = await commRepo.getOrCreateThread(screeningId, body.title)

    // Auto join
    await commRepo.joinThread(thread.id, user.id)

    return c.json(thread)
})

// Get messages for a thread
communicationRoutes.get('/threads/:threadId/messages', async (c) => {
    const threadId = c.req.param('threadId')
    const commRepo = new CommunicationRepository(pool)

    const thread = await commRepo.getThreadById(threadId)
    if (!thread) {
        return c.json({ error: 'Thread not found' }, 404)
    }

    const canAccess = await commRepo.canAccessScreeningThread(thread.screening_id, c.get('user').id)
    if (!canAccess) {
        return c.json({ error: 'Forbidden for this thread' }, 403)
    }

    const isParticipant = await commRepo.isThreadParticipant(threadId, c.get('user').id)
    if (!isParticipant) {
        await commRepo.joinThread(threadId, c.get('user').id)
    }

    const messages = await commRepo.getMessages(threadId)
    return c.json({ messages })
})

// Post a new message to a thread
communicationRoutes.post('/threads/:threadId/messages', async (c) => {
    const threadId = c.req.param('threadId')
    const user = c.get('user')
    const payload = await c.req.json<{
        contentText?: string
        audioFileUrl?: string
        audioTranscription?: string
        viewerAnnotationJson?: any
    }>()

    const commRepo = new CommunicationRepository(pool)

    const thread = await commRepo.getThreadById(threadId)
    if (!thread) {
        return c.json({ error: 'Thread not found' }, 404)
    }

    const canAccess = await commRepo.canAccessScreeningThread(thread.screening_id, user.id)
    if (!canAccess) {
        return c.json({ error: 'Forbidden for this thread' }, 403)
    }

    // Ensure user is in the thread participants (auto-join)
    await commRepo.joinThread(threadId, user.id)

    const newMessage = await commRepo.createMessage({
        threadId,
        senderId: user.id,
        contentText: payload.contentText,
        audioFileUrl: payload.audioFileUrl,
        audioTranscription: payload.audioTranscription,
        viewerAnnotationJson: payload.viewerAnnotationJson
    })

    // Typically we'd emit via WebSocket here if connected
    // io.to(`thread_${threadId}`).emit('new_message', newMessage)

    return c.json(newMessage, 201)
})
