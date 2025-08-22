// utils/wialonApi.ts
export async function fetchUnits(sid: string) {
  const resp = await fetch('https://hst-api.wialon.com/wialon/ajax.html', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      svc: 'core/search_items',
      params: JSON.stringify({
        spec: {
          itemsType: 'avl_unit',
          propName: 'sys_name',
          propValueMask: '*',
          sortType: 'sys_name',
        },
        force: 1,
        flags: 1,
        from: 0,
        to: 0,
      }),
      sid,
    }),
  });
  return resp.json();
}
