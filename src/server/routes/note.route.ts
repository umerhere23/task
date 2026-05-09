import { withErrorHandling } from '@/server/middleware/http.middleware';
import { NextRequest } from 'next/server';
import { getNotesController, addNoteController, updateNoteController, deleteNoteController } from '@/server/controllers/note.controller';

export const noteRoutes = {
  GET: withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return getNotesController(req, { params: { customerId } });
  }),
  POST: withErrorHandling(async (req: NextRequest) => {
    const customerId = req.nextUrl.pathname.split('/')[3];
    return addNoteController(req, { params: { customerId } });
  }),
};

export const noteDetailRoutes = {
  PUT: withErrorHandling(async (req: NextRequest) => {
    const noteId = req.nextUrl.pathname.split('/')[3];
    return updateNoteController(req, { params: { noteId } });
  }),
  DELETE: withErrorHandling(async (req: NextRequest) => {
    const noteId = req.nextUrl.pathname.split('/')[3];
    return deleteNoteController(req, { params: { noteId } });
  }),
};
