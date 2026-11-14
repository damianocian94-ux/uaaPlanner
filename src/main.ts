import './styles/v15.css';
import './styles/app.css';

import { initCalendar, render } from './modules/calendar';
import { initDateModal } from './modules/dateModal';
import { initExportImport } from './modules/exportImport';
import { initExtraModal } from './modules/extraModal';
import { initIdeas } from './modules/ideas';
import { initLibrary } from './modules/library';
import { initPostForm } from './modules/postForm';
import { initSession } from './modules/session';
import { countTasks, initTasks } from './modules/tasks';
import { state } from './state';
import { loadIdeas, loadPosts } from './store/local';

state.posts = loadPosts();
state.ideas = loadIdeas();

initDateModal();
initExtraModal();
initPostForm();
initCalendar();
initIdeas();
initTasks();
initLibrary();
initExportImport();

render();

void initSession({
  onEnter: () => {
    render();
    countTasks();
  },
});
