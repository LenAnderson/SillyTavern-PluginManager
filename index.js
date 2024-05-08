import { getRequestHeaders } from '../../../../script.js';
import { showLoader } from '../../../loader.js';
import { POPUP_RESULT, POPUP_TYPE, Popup } from '../../../popup.js';
import { delay } from '../../../utils.js';

let requiresRestart = false;

const showPluginManager = async()=>{
    const makeDom = async()=>{
        const listResponse = await fetch('/api/plugins/pluginmanager/list');
        if (!listResponse.ok) {
            return 'Something went wrong';
        }
        const plugins = await listResponse.json();
        const dom = document.createElement('div'); {
            dom.classList.add('stpm--root');
            const head = document.createElement('h3'); {
                head.textContent = 'Plugin Manager';
                dom.append(head);
            }
            const form = document.createElement('div'); {
                form.classList.add('stpm--form');
                const inp = document.createElement('input'); {
                    inp.classList.add('text_pole');
                    inp.placeholder = 'Git Repository URL';
                    form.append(inp);
                }
                const btn = document.createElement('div'); {
                    btn.classList.add('menu_button_icon');
                    btn.classList.add('menu_button');
                    btn.title = 'Install server plugin (requires restart)';
                    btn.addEventListener('click', async()=>{
                        if (inp.value.length == 0) return;
                        const response = await fetch('/api/plugins/pluginmanager/install', {
                            method: 'POST',
                            headers: getRequestHeaders(),
                            body: JSON.stringify({ url:inp.value }),
                        });
                        if (!response.ok) return console.warn(response);
                        if (!(await response.json())) return console.warn(response);
                        requiresRestart = true;
                        const item = document.createElement('div'); {
                            item.classList.add('stpm--plugin');
                            const content = document.createElement('div'); {
                                content.classList.add('stpm--content');
                                const name = document.createElement('div'); {
                                    name.classList.add('stpm--name');
                                    name.textContent = inp.value.split('/').slice(-1)[0];
                                    content.append(name);
                                }
                                const dets = document.createElement('div'); {
                                    dets.classList.add('stpm--details');
                                    const repo = document.createElement('a'); {
                                        repo.classList.add('stpm--repo');
                                        repo.textContent = inp.value;
                                        repo.href = inp.value;
                                        repo.target = '_blank';
                                        dets.append(repo);
                                    }
                                    const note = document.createElement('div'); {
                                        note.textContent = 'requires server restart';
                                        dets.append(note);
                                    }
                                    content.append(dets);
                                }
                                item.append(content);
                            }
                            list.append(item);
                        }
                    });
                    const icon = document.createElement('i'); {
                        icon.classList.add('fa-solid');
                        icon.classList.add('fa-puzzle-piece');
                        btn.append(icon);
                    }
                    const lbl = document.createElement('span'); {
                        lbl.textContent = 'Install plugin';
                        btn.append(lbl);
                    }
                    form.append(btn);
                }
                dom.append(form);
            }
            const list = document.createElement('div'); {
                list.classList.add('stpm--list');
                plugins.forEach(async(plugin)=>{
                    let repo;
                    let commit;
                    let branch;
                    let updateBtn;
                    let data = {
                        isUpToDate: true,
                    };
                    const item = document.createElement('div'); {
                        item.classList.add('stpm--plugin');
                        const content = document.createElement('div'); {
                            content.classList.add('stpm--content');
                            const name = document.createElement('div'); {
                                name.classList.add('stpm--name');
                                name.textContent = plugin.name;
                                content.append(name);
                            }
                            const dets = document.createElement('div'); {
                                dets.classList.add('stpm--details');
                                repo = document.createElement('a'); {
                                    repo.classList.add('stpm--repo');
                                    repo.textContent = '...';
                                    repo.target = '_blank';
                                    dets.append(repo);
                                }
                                branch = document.createElement('div'); {
                                    branch.classList.add('stpm--branch');
                                    branch.textContent = '...';
                                    dets.append(branch);
                                }
                                commit = document.createElement('div'); {
                                    commit.classList.add('stpm--commit');
                                    commit.textContent = '...';
                                    dets.append(commit);
                                }
                                content.append(dets);
                            }
                            item.append(content);
                        }
                        const actions = document.createElement('div'); {
                            actions.classList.add('stpm--actions');
                            updateBtn = document.createElement('div'); {
                                updateBtn.classList.add('stpm--action');
                                updateBtn.classList.add('stpm--update');
                                updateBtn.classList.add('stpm--noupdate');
                                updateBtn.classList.add('menu_button');
                                updateBtn.textContent = '...';
                                updateBtn.addEventListener('click', async()=>{
                                    const response = await fetch('/api/plugins/pluginmanager/update', {
                                        method: 'POST',
                                        headers: getRequestHeaders(),
                                        body: JSON.stringify({ plugin:plugin.name }),
                                    });
                                    if (!response.ok) return console.warn(plugin, response);
                                    if (!(await response.json())) return console.warn(plugin, response);
                                    requiresRestart = true;
                                    loadDets();
                                });
                                actions.append(updateBtn);
                            }
                            const removeBtn = document.createElement('div'); {
                                removeBtn.classList.add('stpm--action');
                                removeBtn.classList.add('stpm--remove');
                                removeBtn.classList.add('menu_button');
                                removeBtn.textContent = 'Remove';
                                removeBtn.title = 'Remove server plugin (requires restart)';
                                removeBtn.addEventListener('click', async()=>{
                                    const response = await fetch('/api/plugins/pluginmanager/uninstall', {
                                        method: 'POST',
                                        headers: getRequestHeaders(),
                                        body: JSON.stringify({ plugin:plugin.name }),
                                    });
                                    if (!response.ok) return console.warn(plugin, response);
                                    if (!(await response.json())) return console.warn(plugin, response);
                                    requiresRestart = true;
                                    item.remove();
                                    loadDets();
                                });
                                actions.append(removeBtn);
                            }
                            item.append(actions);
                        }
                        list.append(item);
                        const loadDets = async()=>{
                            const response = await fetch('/api/plugins/pluginmanager/hasUpdates', {
                                method: 'POST',
                                headers: getRequestHeaders(),
                                body: JSON.stringify({ plugin:plugin.name }),
                            });
                            if (!response.ok) {
                                console.warn(plugin, response);
                                return;
                            }
                            data = await response.json();
                            if (!data.isRepo) {
                                repo.textContent = 'not a git repository';
                                branch.textContent = 'N/A';
                                commit.textContent = 'N/A';
                                updateBtn.textContent = 'no repo';
                                return;
                            }
                            repo.href = data.remoteUrl;
                            repo.textContent = data.remoteUrl;
                            branch.textContent = data.branch.current;
                            commit.textContent = data.commit;
                            if (data.isUpToDate) {
                                updateBtn.textContent = 'no update';
                                updateBtn.classList.add('stpm--noupdate');
                            } else {
                                updateBtn.textContent = 'Update';
                                updateBtn.classList.remove('stpm--noupdate');
                                updateBtn.title = 'Update server plugin (requires restart)';
                            }
                        };
                        loadDets();
                    }
                });
                dom.append(list);
            }
        }
        return dom;
    };
    const dlg = new Popup(await makeDom(), POPUP_TYPE.TEXT, null, { okButton:'Close' });
    await dlg.show();
    if (requiresRestart) {
        toastr.info('Restarting SillyTavern');
        showLoader();
        await fetch('/api/plugins/pluginmanager/restart');
        await delay(1000);
        while (!(await fetch('/', { method:'HEAD' })).ok) await delay(100);
        location.reload();
    }
};


const init = ()=>{
    const extBtn = document.querySelector('#third_party_extension_button');
    const btn = document.createElement('div'); {
        btn.classList.add('menu_button_icon');
        btn.classList.add('menu_button');
        btn.title = 'Manage and install server plugins';
        btn.addEventListener('click', ()=>showPluginManager());
        const icon = document.createElement('i'); {
            icon.classList.add('fa-solid');
            icon.classList.add('fa-puzzle-piece');
            btn.append(icon);
        }
        const lbl = document.createElement('span'); {
            lbl.textContent = 'Manage plugins';
            btn.append(lbl);
        }
        extBtn.insertAdjacentElement('afterend', btn);
    }
};
init();
