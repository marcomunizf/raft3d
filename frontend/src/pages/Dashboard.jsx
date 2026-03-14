import * as T from 'react';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import Modal from '../components/Modal.jsx';
import SalesPage from './SalesPage.jsx';
import CustomersPage from './CustomersPage.jsx';
import InventoryPage from './InventoryPage.jsx';
import MaterialsPage from './MaterialsPage.jsx';
import AdminTypeSidebar from '../components/dashboard/AdminTypeSidebar.jsx';
import { fetchDashboardSummary, fetchSalesSeries, fetchWeightPriceByMaterial } from '../domains/dashboard/dashboard.service.js';
import { getDashboardSlaVariant, DASHBOARD_SLA_LABEL } from '../domains/dashboard/dashboard.ui.js';
import { createSale, fetchSaleDetails, fetchSales, updateSale, updateSaleStatus } from '../domains/sales/sales.service.js';
import { createEmptySaleForm } from '../domains/sales/sales.forms.js';
import { SALE_STATUSES, PAYMENT_STATUSES, STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS } from '../domains/sales/sales.constants.js';
import { createCustomer, fetchCustomers, fetchCustomerSales, updateCustomer } from '../domains/customers/customers.service.js';
import { createEmptyCustomerForm } from '../domains/customers/customers.forms.js';
import { createInventoryItem, fetchInventory, updateInventoryItem } from '../domains/inventory/inventory.service.js';
import { createEmptyItemForm } from '../domains/inventory/inventory.forms.js';
import { createUser, deactivateUser, deleteUser, fetchUsers, updateUser, updateUserPassword } from '../domains/users/users.service.js';
import { createEmptyUserForm, createEmptyPasswordForm } from '../domains/users/users.forms.js';
import { PERMISSION_LABELS } from '../domains/users/users.constants.js';
import { formatDate, formatCurrency } from '../domains/shared/formatters.js';
import { getTokenUserId } from '../domains/auth/auth.utils.js';
const za = createEmptyUserForm();
const Ua = createEmptyPasswordForm();
const _c = createEmptySaleForm();
const kc = createEmptyCustomerForm();
const Rc = createEmptyItemForm();
const Kg = getDashboardSlaVariant;
const Jg = DASHBOARD_SLA_LABEL;
const Ec = SALE_STATUSES;
const Cc = PAYMENT_STATUSES;
const hn = STATUS_LABELS;
const Mn = PAYMENT_STATUS_LABELS;
const Nc = PAYMENT_METHOD_LABELS;
const Ba = PERMISSION_LABELS;
const vt = formatDate;
const gt = formatCurrency;
const l = {
  jsx,
  jsxs,
  Fragment
};
const Yf = Modal;
const wc = fetchDashboardSummary;
const Sc = fetchSalesSeries;
const Pc = fetchWeightPriceByMaterial;
const zn = fetchSales;
const jp = fetchSaleDetails;
const wp = createSale;
const Fg = updateSale;
const $o = updateSaleStatus;
const sr = fetchCustomers;
const Sp = createCustomer;
const Np = updateCustomer;
const Vo = fetchCustomerSales;
const Zs = fetchInventory;
const Ep = createInventoryItem;
const Cp = updateInventoryItem;
const Pr = fetchUsers;
const Bg = createUser;
const $g = updateUser;
const Vg = deleteUser;
const qg = deactivateUser;
const _p = updateUserPassword;
const kp = getTokenUserId;
const SUMMARY_PERMISSION_BY_TYPE = {
  RESINA: "ver_resumo_resina",
  FDM: "ver_resumo_fdm"
};
const LEGACY_SUMMARY_PERMISSION = "ver_resumo";
const ALL_SUMMARY_PERMISSIONS = [LEGACY_SUMMARY_PERMISSION, ...Object.values(SUMMARY_PERMISSION_BY_TYPE)];
const PRIMARY_PRODUCTION_PERMISSIONS = ['producao-resina', 'producao-fdm', 'producao'];
const isSummaryPermission = p => ALL_SUMMARY_PERMISSIONS.includes(p);
const isPrimaryProductionPermission = p => PRIMARY_PRODUCTION_PERMISSIONS.includes(p);
const hasSummaryForType = (permissions = [], type) => permissions.includes(LEGACY_SUMMARY_PERMISSION) || permissions.includes(SUMMARY_PERMISSION_BY_TYPE[type]);
const hasProjetistaPermission = (permissions = []) => permissions.includes('projetista');
const setProjetistaPermission = (permissions = [], enabled) => {
  const withoutProjetista = permissions.filter(permission => permission !== 'projetista');
  if (enabled) withoutProjetista.push('projetista');
  return withoutProjetista;
};
const setPrimaryProductionPermission = (permissions = [], nextPermission) => {
  const withoutPrimary = permissions.filter(permission => !isPrimaryProductionPermission(permission));
  return [...withoutPrimary, nextPermission];
};
const setSummaryForType = (permissions = [], type, enabled) => {
  const otherType = type === "RESINA" ? "FDM" : "RESINA";
  const nextForOther = hasSummaryForType(permissions, otherType);
  const cleaned = permissions.filter(p => !isSummaryPermission(p));
  if (enabled) cleaned.push(SUMMARY_PERMISSION_BY_TYPE[type]);
  if (nextForOther) cleaned.push(SUMMARY_PERMISSION_BY_TYPE[otherType]);
  return cleaned;
};
function Yg({
  onLogout: e
}) {
  const [t, n] = T.useState(null),
    [r, s] = T.useState(null),
    [a, o] = T.useState([]),
    [i, c] = T.useState([]),
    [f, h] = T.useState([]),
    [x, w] = T.useState(""),
    [E, v] = T.useState([]),
    [N, R] = T.useState([]),
    [m, p] = T.useState([]),
    [y, _] = T.useState([]),
    [A, O] = T.useState(!1),
    [k, C] = T.useState(""),
    [K, $] = T.useState(""),
    [V, Ee] = T.useState("RESINA"),
    [Me, Ce] = T.useState(""),
    [he, W] = T.useState(!1),
    we = T.useRef(null),
    [D, M] = T.useState([]),
    [F, b] = T.useState(za),
    [U, oe] = T.useState(null),
    [Z, lt] = T.useState(null),
    [ve, q] = T.useState(Ua),
    [gr, ee] = T.useState(null),
    [J, at] = T.useState(null),
    [Ot, z] = T.useState(null),
    [ie, Fe] = T.useState(null),
    [fn, G] = T.useState([]),
    [bn, Kn] = T.useState([]),
    [X, On] = T.useState(null),
    [_e, ht] = T.useState(null),
    [mt, pn] = T.useState(null),
    [ke, ue] = T.useState(_c),
    [Ye, Ve] = T.useState(kc),
    [Xe, _t] = T.useState(Rc),
    qt = T.useRef(null),
    [pg, setPg] = T.useState(null);
  T.useEffect(() => {
    const u = g => {
      we.current && !we.current.contains(g.target) && W(!1);
    };
    return document.addEventListener("mousedown", u), () => document.removeEventListener("mousedown", u);
  }, []), T.useEffect(() => {
    wc(V).then(u => s(u)).catch(() => {}), Sc(V, "day").then(u => o(u)).catch(() => {});
  }, [V]), T.useEffect(() => {
    if (!t) return;
    C(""), $(""), O(!0);
    const g = {
      sales: () => (Ce(V), zn({
        type: V
      }).then(L => c(L))),
      "new-sale": () => (ue({
        ..._c,
        type: V
      }), Promise.resolve()),
      "new-customer": () => (Ve(kc), Promise.resolve()),
      "new-item": () => (_t({
        ...Rc,
        type: V
      }), Promise.resolve()),
      customers: () => (w(""), sr().then(L => h(L))),
      inventory: () => Zs({
        type: V
      }).then(L => v(L)),
      "alert-low-stock": () => Zs({
        type: V
      }).then(L => {
        R(L.filter(te => Number(te.current_qty) <= Number(te.min_qty)));
      }),
      "alert-in-production": () => zn({
        status: "IN_PRODUCTION",
        type: V
      }).then(L => {
        p(L);
      }),
      "alert-pending-payments": () => zn({
        type: V
      }).then(L => {
        _(L.filter(te => ["PENDING", "PARTIAL"].includes(te.payment_status) && !["DELIVERED", "CANCELLED"].includes(te.status)));
      }),
      "kpi-average-weight": () => Pc(V).then(L => Kn(L)),
      users: () => Pr().then(L => M(L)),
      "new-user": () => (b(za), Promise.resolve()),
      "change-password": () => (q(Ua), Promise.resolve())
    }[t];
    g ? g().catch(() => {}).finally(() => O(!1)) : O(!1);
  }, [t]);
  const Ln = () => {
      wc(V).then(u => s(u)).catch(() => {}), Sc(V, "day").then(u => o(u)).catch(() => {});
    },
    Wl = async () => {
      var u, g;
      if (C(""), $(""), ve.nova_senha !== ve.confirma_senha) {
        C("As senhas nao coincidem.");
        return;
      }
      if (ve.nova_senha.length < 4) {
        C("A nova senha deve ter pelo menos 4 caracteres.");
        return;
      }
      try {
        const L = kp();
        await _p(L, {
          senha_atual: ve.senha_atual,
          nova_senha: ve.nova_senha
        }), $("Senha alterada com sucesso!"), q(Ua);
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao alterar senha.");
      }
    },
    Ql = async () => {
      var u, g, L, te, Wi, Qi;
      C("");
      try {
        const permissions = F.role === "ADMIN" ? [] : F.permissions || [];
        await Bg({
          usuario: (F.usuario || "").trim(),
          senha: F.senha,
          role: F.role,
          permissions
        }), M(await Pr()), n("users"), b(za);
      } catch (bn) {
        const Ki = (te = (L = (g = (u = bn == null ? void 0 : bn.response) == null ? void 0 : u.data) == null ? void 0 : g.details) == null ? void 0 : L[0]) == null ? void 0 : te.message,
          Rp = Ki ? Ki.replaceAll('"', "") : null;
        C(Rp || ((Qi = (Wi = bn == null ? void 0 : bn.response) == null ? void 0 : Wi.data) == null ? void 0 : Qi.message) || "Erro ao criar usuario.");
      }
    },
    Kl = async u => {
      var g, L;
      C("");
      try {
        await qg(u), M(await Pr());
      } catch (te) {
        C(((L = (g = te == null ? void 0 : te.response) == null ? void 0 : g.data) == null ? void 0 : L.message) || "Erro ao desativar usuario.");
      }
    },
    Jl = async u => {
      var g, L;
      if (window.confirm(`Excluir o usuario ${u.email || u.name}? Essa acao remove do banco.`)) {
        C("");
        try {
          await Vg(u.id), M(await Pr());
        } catch (te) {
          C(((L = (g = te == null ? void 0 : te.response) == null ? void 0 : g.data) == null ? void 0 : L.message) || "Erro ao excluir usuario.");
        }
      }
    },
    Gl = u => {
      lt(u), oe({
        role: u.role,
        permissions: u.permissions || []
      }), C(""), n("edit-user");
    },
    Yl = async () => {
      var u, g;
      if (!(!Z || !U)) {
        C("");
        try {
          const L = {
            role: U.role,
            permissions: U.role === "ADMIN" ? [] : U.permissions || []
          };
          await $g(Z.id, L), M(await Pr()), n("users"), lt(null), oe(null);
        } catch (L) {
          C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao atualizar usuario.");
        }
      }
    },
    Xl = u => {
      w(u), clearTimeout(qt.current), qt.current = setTimeout(() => {
        sr(u ? {
          q: u
        } : {}).then(g => h(g)).catch(() => {});
      }, 280);
    },
    De = u => n(u),
    kt = () => {
      n(null), lt(null), ee(null), z(null), On(null), ht(null), at(null), oe(null), Fe(null), pn(null), G([]);
    },
    Zl = (() => {
      if (!a.length) return [0, 0, 0, 0, 0, 0, 0];
      const u = a.slice(-7),
        g = Math.max(...u.map(L => Number(L.total)));
      return u.map(L => g > 0 ? Math.round(Number(L.total) / g * 100) : 0);
    })(),
    ea = async () => {
      var u, g;
      C("");
      try {
        const L = Number(ke.subtotal) || Number(ke.total) || 0,
          te = Number(ke.total) || L;
        await wp({
          ...ke,
          subtotal: L,
          discount_total: Number(ke.discount_total) || 0,
          total: te,
          due_date: ke.due_date || null,
          customer_name_snapshot: ke.customer_name_snapshot || "Venda generica"
        }), Ln(), kt();
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao salvar venda.");
      }
    },
    ta = async () => {
      var u, g;
      C("");
      try {
        await Sp(Ye), kt();
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao salvar cliente.");
      }
    },
    na = async () => {
      var u, g;
      C("");
      try {
        await Ep({
          ...Xe,
          min_qty: Number(Xe.min_qty) || 0,
          current_qty: Number(Xe.current_qty) || 0
        }), Ln(), kt();
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao salvar item.");
      }
    },
    gs = u => {
      ee(u), at({
        name: u.name,
        brand: u.brand || "",
        category: u.category,
        unit: u.unit,
        min_qty: String(u.min_qty),
        current_qty: String(u.current_qty)
      }), C(""), n("edit-item");
    },
    ra = async () => {
      var u, g;
      C("");
      try {
        await Cp(gr.id, {
          ...J,
          min_qty: Number(J.min_qty),
          current_qty: Number(J.current_qty)
        }), v(await Zs()), Ln(), n("inventory"), ee(null), at(null);
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao atualizar item.");
      }
    },
    sa = async u => {
      z(u), Fe({
        type: u.type,
        name: u.name,
        phone: u.phone,
        document: u.document || "",
        email: u.email || "",
        notes: u.notes || ""
      }), G([]), C(""), n("edit-customer");
      try {
        G(await Vo(u.id));
      } catch {}
    },
    vr = async () => {
      var u, g;
      C("");
      try {
        await Np(Ot.id, ie), h(await sr(x ? {
          q: x
        } : {})), n("customers"), z(null);
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao atualizar cliente.");
      }
    },
    xr = u => {
      ht(u), pn({
        status: u.status,
        payment_status: u.payment_status
      }), C(""), n("edit-sale");
    },
    la = async () => {
      var u, g;
      C("");
      try {
        await $o(_e.id, mt), c(await zn()), Ln(), n("sales"), ht(null);
      } catch (L) {
        C(((g = (u = L == null ? void 0 : L.response) == null ? void 0 : u.data) == null ? void 0 : g.message) || "Erro ao atualizar venda.");
      }
    },
    aa = () => {
      if (A) return l.jsx("p", {
        className: "muted",
        children: "Carregando..."
      });
      if (t === "sales") {
        const u = g => {
          Ce(g), O(!0), zn(g ? {
            type: g
          } : {}).then(L => c(L)).catch(() => {}).finally(() => O(!1));
        };
        return l.jsxs("div", {
          className: "modal-section",
          children: [l.jsxs("div", {
            className: "modal-top-bar",
            children: [l.jsxs("select", {
              value: Me,
              onChange: g => u(g.target.value),
              style: {
                padding: "8px 12px",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #d7ccb9",
                fontWeight: 600
              },
              children: [l.jsx("option", {
                value: "",
                children: "Todos os tipos"
              }), l.jsx("option", {
                value: "RESINA",
                children: "Resina"
              }), l.jsx("option", {
                value: "FDM",
                children: "FDM"
              })]
            }), l.jsx("button", {
              className: "btn btn-primary",
              onClick: () => De("new-sale"),
              type: "button",
              children: "+ Nova venda"
            })]
          }), i.length === 0 ? l.jsx("p", {
            className: "muted",
            children: "Nenhuma venda registrada."
          }) : l.jsxs("table", {
            className: "data-table",
            children: [l.jsx("thead", {
              children: l.jsxs("tr", {
                children: [l.jsx("th", {
                  children: "Data"
                }), l.jsx("th", {
                  children: "Cliente"
                }), l.jsx("th", {
                  children: "Tipo"
                }), l.jsx("th", {
                  children: "Total"
                }), l.jsx("th", {
                  children: "Entrega"
                }), l.jsx("th", {
                  children: "SLA"
                }), l.jsx("th", {
                  children: "Status"
                }), l.jsx("th", {
                  children: "Pagamento"
                })]
              })
            }), l.jsx("tbody", {
              children: i.map(g => {
                var te;
                const L = Kg(g.due_date, g.status);
                return l.jsxs("tr", {
                  className: "row-clickable",
                  onClick: () => xr(g),
                  children: [l.jsx("td", {
                    children: vt(g.sale_date)
                  }), l.jsx("td", {
                    children: l.jsx("strong", {
                      children: g.customer_name_snapshot
                    })
                  }), l.jsx("td", {
                    children: l.jsx("span", {
                      className: "pill",
                      style: {
                        background: g.type === "FDM" ? "var(--raft-magenta)" : "var(--raft-green)",
                        color: "#fff"
                      },
                      children: g.type === "FDM" ? "FDM" : "Resina"
                    })
                  }), l.jsx("td", {
                    children: gt(g.total)
                  }), l.jsx("td", {
                    children: vt(g.due_date)
                  }), l.jsx("td", {
                    children: L ? l.jsx("span", {
                      className: `pill pill--${L}`,
                      children: Jg[L]
                    }) : "-"
                  }), l.jsx("td", {
                    children: l.jsx("span", {
                      className: "pill pill--status",
                      children: hn[g.status] || g.status
                    })
                  }), l.jsx("td", {
                    children: l.jsx("span", {
                      className: `pill pill--pay pill--pay-${(te = g.payment_status) == null ? void 0 : te.toLowerCase()}`,
                      children: Mn[g.payment_status] || g.payment_status
                    })
                  })]
                }, g.id);
              })
            })]
          })]
        });
      }
      if (t === "kpi-average-weight") return l.jsx("div", {
        className: "modal-section",
        children: bn.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Sem dados com valor e peso/volume para o periodo."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Tipo de material"
              }), l.jsx("th", {
                children: "Ultimos 3 meses"
              }), l.jsx("th", {
                children: "Ultimo ano"
              })]
            })
          }), l.jsx("tbody", {
            children: bn.map(u => l.jsxs("tr", {
              children: [l.jsx("td", {
                children: u.material_type || "-"
              }), l.jsx("td", {
                children: `${gt(u.avg_value_per_weight_3m)} / ${V === "FDM" ? "g" : "ml"}`
              }), l.jsx("td", {
                children: `${gt(u.avg_value_per_weight_1y)} / ${V === "FDM" ? "g" : "ml"}`
              })]
            }, `${u.material_type}-${u.type}`))
          })]
        })
      });
      return t === "edit-sale" ? l.jsxs("div", {
        className: "modal-section",
        children: [l.jsxs("div", {
          className: "detail-header",
          children: [l.jsxs("p", {
            className: "muted",
            children: [_e == null ? void 0 : _e.customer_name_snapshot, " - ", gt(_e == null ? void 0 : _e.total)]
          }), l.jsxs("p", {
            className: "muted",
            children: ["Venda: ", vt(_e == null ? void 0 : _e.sale_date), " | Entrega: ", vt(_e == null ? void 0 : _e.due_date)]
          })]
        }), l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), la();
          },
          children: [l.jsxs("label", {
            children: ["Status do pedido", l.jsx("select", {
              value: mt == null ? void 0 : mt.status,
              onChange: u => pn(g => ({
                ...g,
                status: u.target.value
              })),
              children: Ec.map(u => l.jsx("option", {
                value: u,
                children: hn[u] || u
              }, u))
            })]
          }), l.jsxs("label", {
            children: ["Status do pagamento", l.jsx("select", {
              value: mt == null ? void 0 : mt.payment_status,
              onChange: u => pn(g => ({
                ...g,
                payment_status: u.target.value
              })),
              children: Cc.map(u => l.jsx("option", {
                value: u,
                children: Mn[u] || u
              }, u))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => {
                n("sales"), ht(null);
              },
              children: "Voltar"
            })]
          })]
        })]
      }) : t === "new-sale" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), ea();
          },
          children: [l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Cliente", l.jsx(Gg, {
              value: ke.customer_name_snapshot,
              onSelect: (u, g) => ue(L => ({
                ...L,
                customer_id: u,
                customer_name_snapshot: g
              })),
              placeholder: "Buscar por nome ou CPF/CNPJ..."
            })]
          }), l.jsxs("label", {
            children: ["Data da venda", l.jsx("input", {
              type: "date",
              value: ke.sale_date,
              required: !0,
              onChange: u => ue(g => ({
                ...g,
                sale_date: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Previsao de entrega", l.jsx("input", {
              type: "date",
              value: ke.due_date,
              onChange: u => ue(g => ({
                ...g,
                due_date: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Valor total (R$)", l.jsx("input", {
              type: "number",
              min: "0",
              step: "0.01",
              placeholder: "0,00",
              required: !0,
              value: ke.total,
              onChange: u => ue(g => ({
                ...g,
                total: u.target.value,
                subtotal: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Tipo", l.jsxs("select", {
              value: ke.type,
              onChange: u => ue(g => ({
                ...g,
                type: u.target.value
              })),
              children: [l.jsx("option", {
                value: "RESINA",
                children: "Resina"
              }), l.jsx("option", {
                value: "FDM",
                children: "FDM"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Status do pedido", l.jsx("select", {
              value: ke.status,
              onChange: u => ue(g => ({
                ...g,
                status: u.target.value
              })),
              children: Ec.map(u => l.jsx("option", {
                value: u,
                children: hn[u] || u
              }, u))
            })]
          }), l.jsxs("label", {
            children: ["Pagamento", l.jsx("select", {
              value: ke.payment_status,
              onChange: u => ue(g => ({
                ...g,
                payment_status: u.target.value
              })),
              children: Cc.map(u => l.jsx("option", {
                value: u,
                children: Mn[u] || u
              }, u))
            })]
          }), l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Observacoes", l.jsx("textarea", {
              rows: "3",
              placeholder: "Detalhes da venda",
              value: ke.notes,
              onChange: u => ue(g => ({
                ...g,
                notes: u.target.value
              }))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar venda"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: kt,
              children: "Cancelar"
            })]
          })]
        })
      }) : t === "customers" ? l.jsxs("div", {
        className: "modal-section",
        children: [l.jsxs("div", {
          className: "modal-top-bar",
          children: [l.jsx("input", {
            className: "search-input",
            type: "text",
            placeholder: "Buscar por nome, CPF/CNPJ...",
            value: x,
            onChange: u => Xl(u.target.value)
          }), l.jsx("button", {
            className: "btn btn-primary",
            type: "button",
            onClick: () => De("new-customer"),
            children: "+ Novo cliente"
          })]
        }), f.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum cliente encontrado."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Nome"
              }), l.jsx("th", {
                children: "Tipo"
              }), l.jsx("th", {
                children: "CPF/CNPJ"
              }), l.jsx("th", {
                children: "Telefone"
              }), l.jsx("th", {
                children: "Email"
              })]
            })
          }), l.jsx("tbody", {
            children: f.map(u => l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => sa(u),
              children: [l.jsx("td", {
                children: l.jsx("strong", {
                  children: u.name
                })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill",
                  children: u.type
                })
              }), l.jsx("td", {
                children: u.document || "-"
              }), l.jsx("td", {
                children: u.phone
              }), l.jsx("td", {
                children: u.email || "-"
              })]
            }, u.id))
          })]
        })]
      }) : t === "edit-customer" ? l.jsxs("div", {
        className: "modal-section",
        children: [l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), vr();
          },
          children: [l.jsxs("label", {
            children: ["Nome", l.jsx("input", {
              type: "text",
              required: !0,
              value: ie == null ? void 0 : ie.name,
              onChange: u => Fe(g => ({
                ...g,
                name: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Tipo", l.jsxs("select", {
              value: ie == null ? void 0 : ie.type,
              onChange: u => Fe(g => ({
                ...g,
                type: u.target.value
              })),
              children: [l.jsx("option", {
                value: "PF",
                children: "Pessoa Fisica"
              }), l.jsx("option", {
                value: "PJ",
                children: "Pessoa Juridica"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Telefone / WhatsApp", l.jsx("input", {
              type: "text",
              value: ie == null ? void 0 : ie.phone,
              onChange: u => Fe(g => ({
                ...g,
                phone: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["CPF / CNPJ", l.jsx("input", {
              type: "text",
              value: ie == null ? void 0 : ie.document,
              onChange: u => Fe(g => ({
                ...g,
                document: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Email", l.jsx("input", {
              type: "email",
              value: ie == null ? void 0 : ie.email,
              onChange: u => Fe(g => ({
                ...g,
                email: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Observacoes", l.jsx("input", {
              type: "text",
              value: ie == null ? void 0 : ie.notes,
              onChange: u => Fe(g => ({
                ...g,
                notes: u.target.value
              }))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar alteracoes"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => {
                n("customers"), z(null);
              },
              children: "Voltar"
            })]
          })]
        }), l.jsxs("div", {
          className: "customer-sales-section",
          children: [l.jsx("h4", {
            children: "Pedidos do cliente"
          }), fn.length === 0 ? l.jsx("p", {
            className: "muted",
            children: "Nenhum pedido encontrado."
          }) : l.jsxs("table", {
            className: "data-table",
            children: [l.jsx("thead", {
              children: l.jsxs("tr", {
                children: [l.jsx("th", {
                  children: "Data"
                }), l.jsx("th", {
                  children: "Item / Arquivo"
                }), l.jsx("th", {
                  children: "Total"
                }), l.jsx("th", {
                  children: "Entrega"
                }), l.jsx("th", {
                  children: "Pagamento"
                }), l.jsx("th", {
                  children: "Status"
                })]
              })
            }), l.jsx("tbody", {
              children: fn.map(u => {
                var g;
                return l.jsxs("tr", {
                  className: "row-clickable",
                  onClick: () => oa(u.id),
                  children: [l.jsx("td", {
                    children: vt(u.sale_date)
                  }), l.jsx("td", {
                    children: u.file_name || "-"
                  }), l.jsx("td", {
                    children: gt(u.total)
                  }), l.jsx("td", {
                    children: vt(u.due_date)
                  }), l.jsx("td", {
                    children: l.jsx("span", {
                      className: `pill pill--pay pill--pay-${(g = u.payment_status) == null ? void 0 : g.toLowerCase()}`,
                      children: Mn[u.payment_status] || u.payment_status
                    })
                  }), l.jsx("td", {
                    children: l.jsx("span", {
                      className: "pill pill--status",
                      children: hn[u.status] || u.status
                    })
                  })]
                }, u.id);
              })
            })]
          })]
        })]
      }) : t === "customer-sale-detail" ? l.jsx("div", {
        className: "modal-section",
        children: X ? l.jsxs(l.Fragment, {
          children: [l.jsxs("div", {
            className: "detail-header",
            children: [l.jsx("p", {
              children: l.jsxs("strong", {
                children: ["Pedido de ", X.customer_name_snapshot]
              })
            }), l.jsxs("p", {
              className: "muted",
              children: ["Venda: ", vt(X.sale_date), " | Entrega: ", vt(X.due_date)]
            }), l.jsxs("p", {
              className: "muted",
              children: ["Total: ", gt(X.total)]
            }), l.jsxs("p", {
              className: "muted",
              children: ["Status: ", hn[X.status] || X.status]
            }), l.jsxs("p", {
              className: "muted",
              children: ["Pagamento: ", Mn[X.payment_status] || X.payment_status]
            }), l.jsxs("p", {
              className: "muted",
              children: ["Metodo: ", Nc[X.payment_method] || X.payment_method || "-"]
            }), l.jsxs("p", {
              className: "muted",
              children: ["Observacoes: ", X.notes || "-"]
            })]
          }), l.jsx("div", {
            className: "modal-actions",
            children: l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => n("edit-customer"),
              children: "Voltar"
            })
          }), l.jsx("h4", {
            children: "Itens do pedido"
          }), !X.items || X.items.length === 0 ? l.jsx("p", {
            className: "muted",
            children: "Nenhum item registrado."
          }) : l.jsxs("table", {
            className: "data-table",
            children: [l.jsx("thead", {
              children: l.jsxs("tr", {
                children: [l.jsx("th", {
                  children: "Descricao"
                }), l.jsx("th", {
                  children: "Qtd"
                }), l.jsx("th", {
                  children: "Unitario"
                }), l.jsx("th", {
                  children: "Total"
                })]
              })
            }), l.jsx("tbody", {
              children: X.items.map(u => l.jsxs("tr", {
                children: [l.jsx("td", {
                  children: u.description
                }), l.jsx("td", {
                  children: Number(u.qty)
                }), l.jsx("td", {
                  children: gt(u.unit_price)
                }), l.jsx("td", {
                  children: gt(u.line_total)
                })]
              }, u.id))
            })]
          }), l.jsx("h4", {
            children: "Pagamentos registrados"
          }), !X.payments || X.payments.length === 0 ? l.jsx("p", {
            className: "muted",
            children: "Sem pagamentos registrados."
          }) : l.jsxs("table", {
            className: "data-table",
            children: [l.jsx("thead", {
              children: l.jsxs("tr", {
                children: [l.jsx("th", {
                  children: "Data"
                }), l.jsx("th", {
                  children: "Metodo"
                }), l.jsx("th", {
                  children: "Valor"
                }), l.jsx("th", {
                  children: "Notas"
                })]
              })
            }), l.jsx("tbody", {
              children: X.payments.map(u => l.jsxs("tr", {
                children: [l.jsx("td", {
                  children: Wg(u.paid_at)
                }), l.jsx("td", {
                  children: Nc[u.method] || u.method
                }), l.jsx("td", {
                  children: gt(u.amount)
                }), l.jsx("td", {
                  children: u.notes || "-"
                })]
              }, u.id))
            })]
          })]
        }) : l.jsx("p", {
          className: "muted",
          children: "Pedido nao encontrado."
        })
      }) : t === "new-customer" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), ta();
          },
          children: [l.jsxs("label", {
            children: ["Nome", l.jsx("input", {
              type: "text",
              placeholder: "Nome completo ou razao social",
              required: !0,
              value: Ye.name,
              onChange: u => Ve(g => ({
                ...g,
                name: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Tipo", l.jsxs("select", {
              value: Ye.type,
              onChange: u => Ve(g => ({
                ...g,
                type: u.target.value
              })),
              children: [l.jsx("option", {
                value: "PF",
                children: "Pessoa Fisica"
              }), l.jsx("option", {
                value: "PJ",
                children: "Pessoa Juridica"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Telefone / WhatsApp", l.jsx("input", {
              type: "text",
              placeholder: "11 99999-0000",
              value: Ye.phone,
              onChange: u => Ve(g => ({
                ...g,
                phone: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["CPF / CNPJ", l.jsx("input", {
              type: "text",
              placeholder: "Opcional",
              value: Ye.document,
              onChange: u => Ve(g => ({
                ...g,
                document: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Email", l.jsx("input", {
              type: "email",
              placeholder: "Opcional",
              value: Ye.email,
              onChange: u => Ve(g => ({
                ...g,
                email: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Observacoes", l.jsx("input", {
              type: "text",
              placeholder: "Opcional",
              value: Ye.notes,
              onChange: u => Ve(g => ({
                ...g,
                notes: u.target.value
              }))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: kt,
              children: "Cancelar"
            })]
          })]
        })
      }) : t === "inventory" ? l.jsxs("div", {
        className: "modal-section",
        children: [l.jsx("div", {
          className: "modal-actions",
          children: l.jsx("button", {
            className: "btn btn-primary",
            type: "button",
            onClick: () => De("new-item"),
            children: "+ Novo item"
          })
        }), E.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum item no estoque."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Item"
              }), l.jsx("th", {
                children: "Marca"
              }), l.jsx("th", {
                children: "Categoria"
              }), l.jsx("th", {
                children: "Qtd atual"
              }), l.jsx("th", {
                children: "Minimo"
              }), l.jsx("th", {
                children: "Status"
              })]
            })
          }), l.jsx("tbody", {
            children: E.map(u => {
              const g = Number(u.current_qty) <= Number(u.min_qty);
              return l.jsxs("tr", {
                className: "row-clickable",
                onClick: () => gs(u),
                children: [l.jsx("td", {
                  children: l.jsx("strong", {
                    children: u.name
                  })
                }), l.jsx("td", {
                  children: u.brand || "-"
                }), l.jsx("td", {
                  children: u.category === "RAW_MATERIAL" ? "Mat. prima" : "Consumivel"
                }), l.jsxs("td", {
                  children: [Number(u.current_qty), " ", u.unit]
                }), l.jsxs("td", {
                  children: [Number(u.min_qty), " ", u.unit]
                }), l.jsx("td", {
                  children: l.jsx("span", {
                    className: `pill pill--${g ? "sla-red" : "sla-green"}`,
                    children: g ? "Baixo" : "OK"
                  })
                })]
              }, u.id);
            })
          })]
        })]
      }) : t === "edit-item" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), ra();
          },
          children: [l.jsxs("label", {
            children: ["Nome", l.jsx("input", {
              type: "text",
              required: !0,
              value: J == null ? void 0 : J.name,
              onChange: u => at(g => ({
                ...g,
                name: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Marca", l.jsx("input", {
              type: "text",
              value: J == null ? void 0 : J.brand,
              onChange: u => at(g => ({
                ...g,
                brand: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Categoria", l.jsxs("select", {
              value: J == null ? void 0 : J.category,
              onChange: u => at(g => ({
                ...g,
                category: u.target.value
              })),
              children: [l.jsx("option", {
                value: "RAW_MATERIAL",
                children: "Materia-prima"
              }), l.jsx("option", {
                value: "CONSUMABLE",
                children: "Consumivel"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Unidade", l.jsx("input", {
              type: "text",
              placeholder: "un, L, kg, ml...",
              required: !0,
              value: J == null ? void 0 : J.unit,
              onChange: u => at(g => ({
                ...g,
                unit: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Qtd atual", l.jsx("input", {
              type: "number",
              min: "0",
              step: "0.001",
              required: !0,
              value: J == null ? void 0 : J.current_qty,
              onChange: u => at(g => ({
                ...g,
                current_qty: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Qtd minima", l.jsx("input", {
              type: "number",
              min: "0",
              step: "0.001",
              required: !0,
              value: J == null ? void 0 : J.min_qty,
              onChange: u => at(g => ({
                ...g,
                min_qty: u.target.value
              }))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar alteracoes"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => {
                n("inventory"), ee(null);
              },
              children: "Voltar"
            })]
          })]
        })
      }) : t === "new-item" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), na();
          },
          children: [l.jsxs("label", {
            children: ["Nome", l.jsx("input", {
              type: "text",
              placeholder: "Ex: Resina UV",
              required: !0,
              value: Xe.name,
              onChange: u => _t(g => ({
                ...g,
                name: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Marca", l.jsx("input", {
              type: "text",
              placeholder: "Ex: 3DLAB",
              value: Xe.brand,
              onChange: u => _t(g => ({
                ...g,
                brand: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Tipo", l.jsxs("select", {
              value: Xe.type,
              onChange: u => _t(g => ({
                ...g,
                type: u.target.value
              })),
              children: [l.jsx("option", {
                value: "RESINA",
                children: "Resina"
              }), l.jsx("option", {
                value: "FDM",
                children: "FDM"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Categoria", l.jsxs("select", {
              value: Xe.category,
              onChange: u => _t(g => ({
                ...g,
                category: u.target.value
              })),
              children: [l.jsx("option", {
                value: "RAW_MATERIAL",
                children: "Materia-prima"
              }), l.jsx("option", {
                value: "CONSUMABLE",
                children: "Consumivel"
              })]
            })]
          }), l.jsxs("label", {
            children: ["Unidade", l.jsx("input", {
              type: "text",
              placeholder: "un, L, kg, ml...",
              required: !0,
              value: Xe.unit,
              onChange: u => _t(g => ({
                ...g,
                unit: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Qtd atual", l.jsx("input", {
              type: "number",
              min: "0",
              step: "0.001",
              placeholder: "0",
              required: !0,
              value: Xe.current_qty,
              onChange: u => _t(g => ({
                ...g,
                current_qty: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Qtd minima", l.jsx("input", {
              type: "number",
              min: "0",
              step: "0.001",
              placeholder: "0",
              required: !0,
              value: Xe.min_qty,
              onChange: u => _t(g => ({
                ...g,
                min_qty: u.target.value
              }))
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: kt,
              children: "Cancelar"
            })]
          })]
        })
      }) : t === "alert-low-stock" ? l.jsx("div", {
        className: "modal-section",
        children: N.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum item com estoque baixo."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Item"
              }), l.jsx("th", {
                children: "Marca"
              }), l.jsx("th", {
                children: "Qtd atual"
              }), l.jsx("th", {
                children: "Minimo"
              }), l.jsx("th", {
                children: "Unidade"
              })]
            })
          }), l.jsx("tbody", {
            children: N.map(u => l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => gs(u),
              children: [l.jsx("td", {
                children: l.jsx("strong", {
                  children: u.name
                })
              }), l.jsx("td", {
                children: u.brand || "-"
              }), l.jsx("td", {
                children: Number(u.current_qty)
              }), l.jsx("td", {
                children: Number(u.min_qty)
              }), l.jsx("td", {
                children: u.unit
              })]
            }, u.id))
          })]
        })
      }) : t === "alert-in-production" ? l.jsx("div", {
        className: "modal-section",
        children: m.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum pedido em producao."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Data"
              }), l.jsx("th", {
                children: "Cliente"
              }), l.jsx("th", {
                children: "Total"
              }), l.jsx("th", {
                children: "Entrega"
              }), l.jsx("th", {
                children: "Status"
              })]
            })
          }), l.jsx("tbody", {
            children: m.map(u => l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => xr(u),
              children: [l.jsx("td", {
                children: vt(u.sale_date)
              }), l.jsx("td", {
                children: l.jsx("strong", {
                  children: u.customer_name_snapshot
                })
              }), l.jsx("td", {
                children: gt(u.total)
              }), l.jsx("td", {
                children: vt(u.due_date)
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill pill--status",
                  children: hn[u.status] || u.status
                })
              })]
            }, u.id))
          })]
        })
      }) : t === "alert-pending-payments" ? l.jsx("div", {
        className: "modal-section",
        children: y.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum pagamento pendente."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Data"
              }), l.jsx("th", {
                children: "Cliente"
              }), l.jsx("th", {
                children: "Total"
              }), l.jsx("th", {
                children: "Status"
              }), l.jsx("th", {
                children: "Pagamento"
              })]
            })
          }), l.jsx("tbody", {
            children: y.map(u => {
              var g;
              return l.jsxs("tr", {
                className: "row-clickable",
                onClick: () => xr(u),
                children: [l.jsx("td", {
                  children: vt(u.sale_date)
                }), l.jsx("td", {
                  children: l.jsx("strong", {
                    children: u.customer_name_snapshot
                  })
                }), l.jsx("td", {
                  children: gt(u.total)
                }), l.jsx("td", {
                  children: l.jsx("span", {
                    className: "pill pill--status",
                    children: hn[u.status] || u.status
                  })
                }), l.jsx("td", {
                  children: l.jsx("span", {
                    className: `pill pill--pay pill--pay-${(g = u.payment_status) == null ? void 0 : g.toLowerCase()}`,
                    children: Mn[u.payment_status] || u.payment_status
                  })
                })]
              }, u.id);
            })
          })]
        })
      }) : t === "change-password" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), Wl();
          },
          children: [l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Senha atual", l.jsx("input", {
              type: "password",
              value: ve.senha_atual,
              onChange: u => q(g => ({
                ...g,
                senha_atual: u.target.value
              })),
              required: !0
            })]
          }), l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Nova senha", l.jsx("input", {
              type: "password",
              value: ve.nova_senha,
              onChange: u => q(g => ({
                ...g,
                nova_senha: u.target.value
              })),
              required: !0
            })]
          }), l.jsxs("label", {
            style: {
              gridColumn: "1 / -1"
            },
            children: ["Confirmar nova senha", l.jsx("input", {
              type: "password",
              value: ve.confirma_senha,
              onChange: u => q(g => ({
                ...g,
                confirma_senha: u.target.value
              })),
              required: !0
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), K && l.jsx("div", {
            className: "form-success",
            style: {
              gridColumn: "1 / -1"
            },
            children: K
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Alterar senha"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: kt,
              children: "Cancelar"
            })]
          })]
        })
      }) : t === "users" ? l.jsxs("div", {
        className: "modal-section",
        children: [l.jsx("div", {
          className: "modal-actions",
          children: l.jsx("button", {
            className: "btn btn-primary",
            type: "button",
            onClick: () => De("new-user"),
            children: "+ Novo usuario"
          })
        }), k && l.jsx("div", {
          className: "form-error",
          children: k
        }), D.length === 0 ? l.jsx("p", {
          className: "muted",
          children: "Nenhum usuario encontrado."
        }) : l.jsxs("table", {
          className: "data-table",
          children: [l.jsx("thead", {
            children: l.jsxs("tr", {
              children: [l.jsx("th", {
                children: "Usuario"
              }), l.jsx("th", {
                children: "Role"
              }), l.jsx("th", {
                children: "Permissoes"
              }), l.jsx("th", {
                children: "Status"
              }), l.jsx("th", {})]
            })
          }), l.jsx("tbody", {
            children: D.map(u => l.jsxs("tr", {
              className: "row-clickable",
              onClick: () => Gl(u),
              children: [l.jsx("td", {
                children: l.jsx("strong", {
                  children: u.email || u.name
                })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: "pill",
                  children: u.role
                })
              }), l.jsx("td", {
                children: l.jsx("div", { style: { maxWidth: "360px", whiteSpace: "normal", wordBreak: "break-word", lineHeight: 1.4 }, children: (u.permissions || []).map(g => Ba[g] || g).join(", ") || "-" })
              }), l.jsx("td", {
                children: l.jsx("span", {
                  className: `pill pill--${u.is_active ? "sla-green" : "sla-red"}`,
                  children: u.is_active ? "Ativo" : "Inativo"
                })
              }), l.jsxs("td", { style: { whiteSpace: "nowrap" }, children: [u.is_active && u.role !== "ADMIN" && l.jsx("button", {
                  className: "btn btn-ghost",
                  type: "button",
                  onClick: g => {
                    g.stopPropagation(), Kl(u.id);
                  },
                  children: "Desativar"
                }), u.role !== "ADMIN" && l.jsx("button", {
                  className: "btn btn-ghost",
                  type: "button",
                  onClick: g => {
                    g.stopPropagation(), Jl(u);
                  },
                  children: "Excluir"
                })]
              })]
            }, u.id))
          })]
        })]
      }) : t === "edit-user" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), Yl();
          },
          children: [l.jsxs("label", {
            children: ["Usuario", l.jsx("input", {
              type: "text",
              value: (Z == null ? void 0 : Z.email) || (Z == null ? void 0 : Z.name) || "",
              disabled: !0
            })]
          }), l.jsxs("label", {
            children: ["Role", l.jsxs("select", {
              value: (U == null ? void 0 : U.role) || "FUNCIONARIO",
              onChange: u => oe(g => ({
                ...g,
                role: u.target.value
              })),
              children: [l.jsx("option", {
                value: "FUNCIONARIO",
                children: "Funcionario"
              }), l.jsx("option", {
                value: "ADMIN",
                children: "Admin"
              })]
            })]
          }), (U == null ? void 0 : U.role) === "FUNCIONARIO" && l.jsxs("div", {
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("p", {
              style: {
                marginBottom: "10px",
                fontWeight: 600
              },
              children: "Permissao"
            }), l.jsx("div", {
              style: {
                display: "flex",
                gap: "20px",
                flexWrap: "wrap"
              },
              children: PRIMARY_PRODUCTION_PERMISSIONS.map(u => l.jsxs("label", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: 500
                },
                children: [l.jsx("input", {
                  type: "radio",
                  name: "edit-permission",
                  value: u,
                  checked: PRIMARY_PRODUCTION_PERMISSIONS.some(g => g === u && (((U == null ? void 0 : U.permissions) || []).includes(g))),
                  onChange: () => oe(g => ({
                    ...g,
                    permissions: setPrimaryProductionPermission(g.permissions || [], u)
                  })),
                  style: {
                    accentColor: "var(--raft-magenta)",
                    width: "16px",
                    height: "16px"
                  }
                }), Ba[u]]
              }, u))
            }), l.jsxs("label", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "12px",
                cursor: "pointer",
                fontWeight: 500
              },
              children: [l.jsx("input", {
                type: "checkbox",
                checked: hasProjetistaPermission((U == null ? void 0 : U.permissions) || []),
                onChange: ev => oe(g => ({
                  ...g,
                  permissions: setProjetistaPermission(g.permissions || [], ev.target.checked)
                })),
                style: {
                  accentColor: "var(--raft-magenta)",
                  width: "16px",
                  height: "16px"
                }
              }), "Projetista"]
            }), l.jsx("p", {
              style: {
                marginTop: "12px",
                marginBottom: "8px",
                fontWeight: 600
              },
              children: "Ver resumo financeiro"
            }), l.jsxs("div", {
              style: {
                display: "flex",
                gap: "16px",
                flexWrap: "wrap"
              },
              children: [l.jsxs("label", {
                style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 500 },
                children: [l.jsx("input", {
                  type: "checkbox",
                  checked: hasSummaryForType((U == null ? void 0 : U.permissions) || [], "RESINA"),
                  onChange: ev => oe(g => ({
                    ...g,
                    permissions: setSummaryForType(g.permissions || [], "RESINA", ev.target.checked)
                  })),
                  style: { accentColor: "var(--raft-magenta)", width: "16px", height: "16px" }
                }), "Resina"]
              }), l.jsxs("label", {
                style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 500 },
                children: [l.jsx("input", {
                  type: "checkbox",
                  checked: hasSummaryForType((U == null ? void 0 : U.permissions) || [], "FDM"),
                  onChange: ev => oe(g => ({
                    ...g,
                    permissions: setSummaryForType(g.permissions || [], "FDM", ev.target.checked)
                  })),
                  style: { accentColor: "var(--raft-magenta)", width: "16px", height: "16px" }
                }), "FDM"]
              })]
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Salvar"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => n("users"),
              children: "Voltar"
            })]
          })]
        })
      }) : t === "new-user" ? l.jsx("div", {
        className: "modal-section",
        children: l.jsxs("form", {
          className: "form-grid",
          onSubmit: u => {
            u.preventDefault(), Ql();
          },
          children: [l.jsxs("label", {
            children: ["Usuario", l.jsx("input", {
              type: "text",
              required: !0,
              value: F.usuario,
              onChange: u => b(g => ({
                ...g,
                usuario: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Senha", l.jsx("input", {
              type: "password",
              minLength: 4,
              required: !0,
              value: F.senha,
              onChange: u => b(g => ({
                ...g,
                senha: u.target.value
              }))
            })]
          }), l.jsxs("label", {
            children: ["Role", l.jsxs("select", {
              value: F.role,
              onChange: u => b(g => ({
                ...g,
                role: u.target.value
              })),
              children: [l.jsx("option", {
                value: "FUNCIONARIO",
                children: "Funcionario"
              }), l.jsx("option", {
                value: "ADMIN",
                children: "Admin"
              })]
            })]
          }), F.role === "FUNCIONARIO" && l.jsxs("div", {
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("p", {
              style: {
                marginBottom: "10px",
                fontWeight: 600
              },
              children: "Permissao"
            }), l.jsx("div", {
              style: {
                display: "flex",
                gap: "20px",
                flexWrap: "wrap"
              },
              children: PRIMARY_PRODUCTION_PERMISSIONS.map(u => l.jsxs("label", {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  cursor: "pointer",
                  fontWeight: 500
                },
                children: [l.jsx("input", {
                  type: "radio",
                  name: "permission",
                  value: u,
                  checked: PRIMARY_PRODUCTION_PERMISSIONS.some(g => g === u && (F.permissions || []).includes(g)),
                  onChange: () => b(g => ({
                    ...g,
                    permissions: setPrimaryProductionPermission(g.permissions || [], u)
                  })),
                  style: {
                    accentColor: "var(--raft-magenta)",
                    width: "16px",
                    height: "16px"
                  }
                }), Ba[u]]
              }, u))
            }), l.jsxs("label", {
              style: {
                display: "flex",
                alignItems: "center",
                gap: "6px",
                marginTop: "12px",
                cursor: "pointer",
                fontWeight: 500
              },
              children: [l.jsx("input", {
                type: "checkbox",
                checked: hasProjetistaPermission(F.permissions || []),
                onChange: ev => b(g => ({
                  ...g,
                  permissions: setProjetistaPermission(g.permissions || [], ev.target.checked)
                })),
                style: {
                  accentColor: "var(--raft-magenta)",
                  width: "16px",
                  height: "16px"
                }
              }), "Projetista"]
            }), l.jsx("p", {
              style: {
                marginTop: "12px",
                marginBottom: "8px",
                fontWeight: 600
              },
              children: "Ver resumo financeiro"
            }), l.jsxs("div", {
              style: {
                display: "flex",
                gap: "16px",
                flexWrap: "wrap"
              },
              children: [l.jsxs("label", {
                style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 500 },
                children: [l.jsx("input", {
                  type: "checkbox",
                  checked: hasSummaryForType(F.permissions || [], "RESINA"),
                  onChange: ev => b(g => ({
                    ...g,
                    permissions: setSummaryForType(g.permissions || [], "RESINA", ev.target.checked)
                  })),
                  style: { accentColor: "var(--raft-magenta)", width: "16px", height: "16px" }
                }), "Resina"]
              }), l.jsxs("label", {
                style: { display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", fontWeight: 500 },
                children: [l.jsx("input", {
                  type: "checkbox",
                  checked: hasSummaryForType(F.permissions || [], "FDM"),
                  onChange: ev => b(g => ({
                    ...g,
                    permissions: setSummaryForType(g.permissions || [], "FDM", ev.target.checked)
                  })),
                  style: { accentColor: "var(--raft-magenta)", width: "16px", height: "16px" }
                }), "FDM"]
              })]
            })]
          }), k && l.jsx("div", {
            className: "form-error",
            style: {
              gridColumn: "1 / -1"
            },
            children: k
          }), l.jsxs("div", {
            className: "modal-actions",
            style: {
              gridColumn: "1 / -1"
            },
            children: [l.jsx("button", {
              className: "btn btn-primary",
              type: "submit",
              children: "Criar usuario"
            }), l.jsx("button", {
              className: "btn btn-ghost",
              type: "button",
              onClick: () => De("users"),
              children: "Voltar"
            })]
          })]
        })
      }) : null;
    },
    oa = async u => {
      var g, L;
      C(""), O(!0);
      try {
        const te = await jp(u);
        On(te), n("customer-sale-detail");
      } catch (te) {
        C(((L = (g = te == null ? void 0 : te.response) == null ? void 0 : g.data) == null ? void 0 : L.message) || "Erro ao carregar detalhes do pedido.");
      } finally {
        O(!1);
      }
    },
    d = {
      sales: "Vendas",
      "new-sale": "Nova venda",
      "new-customer": "Novo cliente",
      "new-item": "Novo item de estoque",
      customers: "Clientes",
      inventory: "Estoque",
      "edit-item": "Editar item",
      "edit-customer": (Ot == null ? void 0 : Ot.name) || "Editar cliente",
      "edit-sale": "Alterar status da venda",
      "customer-sale-detail": "Detalhes do pedido",
      "alert-low-stock": "Itens com estoque baixo",
      "alert-in-production": "Pedidos em producao",
      "alert-pending-payments": "Pagamentos pendentes",
      "kpi-average-weight": "Peso medio por tipo de material",
      users: "Usuarios",
      "new-user": "Novo usuario",
      "edit-user": "Editar usuario",
      "change-password": "Alterar Senha"
    },
    j = V === "RESINA" ? "var(--raft-green)" : "var(--raft-magenta)";
  if (pg === 'sales') return T.createElement(SalesPage, { onBack: () => setPg(null), defaultType: V, processType: V });
  if (pg === 'customers') return T.createElement(CustomersPage, { onBack: () => setPg(null), processType: V });
  if (pg === 'inventory') return T.createElement(InventoryPage, { onBack: () => setPg(null), defaultType: V, processType: V, onOpenMaterials: () => setPg('materials') });
  if (pg === 'materials') return T.createElement(MaterialsPage, { onBack: () => setPg('inventory'), defaultType: V, processType: V });
  return l.jsxs("div", {
    className: "dashboard-layout",
    children: [l.jsx(AdminTypeSidebar, {
      activeType: V,
      onSelectType: Ee
    }), l.jsx("div", {
      className: "dashboard-content",
      children: l.jsxs("div", {
        className: `dashboard process-theme ${V === "FDM" ? "process-theme--fdm" : "process-theme--resina"}`,
        children: [l.jsxs("header", {
          className: "dashboard-header",
          style: {
            alignItems: "flex-start"
          },
          children: [l.jsxs("div", {
            children: [l.jsx("p", {
              className: "eyebrow",
              children: "Painel admin"
            }), l.jsxs("h1", {
              children: ["Dashboard", l.jsxs("span", {
                style: {
                  fontSize: "16px",
                  fontWeight: 700,
                  color: j,
                  fontFamily: "var(--font-ui)",
                  verticalAlign: "middle",
                  marginLeft: "10px"
                },
                children: [" - ", V === "RESINA" ? "Resina" : "FDM"]
              })]
            }), l.jsx("span", {
              className: "muted",
              children: "Resumo do mes atual"
            })]
          }), l.jsxs("div", {
            className: "func-header-actions",
            children: [l.jsx("button", {
            className: "btn btn-outline",
            type: "button",
            onClick: () => De("new-sale"),
            children: "+ Vendas"
          }), l.jsx("button", {
            className: "btn btn-outline",
            type: "button",
            onClick: () => setPg("customers"),
            children: "Clientes"
          }), l.jsx("button", {
            className: "btn btn-outline",
            type: "button",
            onClick: () => setPg("inventory"),
            children: "Estoque"
          }), l.jsx("button", {
            className: "btn btn-outline",
            type: "button",
            onClick: () => setPg("sales"),
            children: "Todos os pedidos"
          }), l.jsxs("div", {
            className: "user-menu",
            ref: we,
            children: [l.jsx("button", {
              className: "btn btn-ghost user-menu-trigger",
              type: "button",
              onClick: () => W(u => !u),
              children: "\u2699\uFE0F"
            }), he && l.jsxs("div", {
              className: "user-menu-dropdown",
              children: [l.jsx("button", {
                className: "user-menu-item",
                type: "button",
                onClick: () => {
                  W(!1), De("change-password");
                },
                children: "Alterar Senha"
              }), l.jsx("button", {
                className: "user-menu-item",
                type: "button",
                onClick: () => {
                  W(!1), De("users");
                },
                children: "Usuarios"
              }), l.jsx("button", {
                className: "user-menu-item user-menu-item--danger",
                type: "button",
                onClick: e,
                children: "Sair"
              })]
              })]
            })]
          })]
        }), l.jsxs("section", {
          className: "kpi-grid",
          children: [l.jsxs("div", {
            className: "kpi-card",
            children: [l.jsx("p", {
              className: "kpi-label",
              children: "Total vendido"
            }), l.jsx("h2", {
              className: "kpi-value",
              children: r ? gt(r.total_sales_month) : "-"
            }), l.jsx("span", {
              className: "muted",
              children: "no mes"
            })]
          }), l.jsxs("div", {
            className: "kpi-card",
            children: [l.jsx("p", {
              className: "kpi-label",
              children: "Qtd de vendas"
            }), l.jsx("h2", {
              className: "kpi-value",
              children: r ? r.sales_count_month : "-"
            }), l.jsx("span", {
              className: "muted",
              children: "pedidos"
            })]
          }), l.jsxs("div", {
            className: "kpi-card",
            children: [l.jsx("p", {
              className: "kpi-label",
              children: "Ticket medio"
            }), l.jsx("h2", {
              className: "kpi-value",
              children: r ? gt(r.average_ticket) : "-"
            }), l.jsx("span", {
              className: "muted",
              children: "por venda"
            })]
          }), l.jsxs("div", {
            className: "kpi-card",
            role: "button",
            tabIndex: 0,
            onClick: () => De("kpi-average-weight"),
            onKeyDown: u => {
              (u.key === "Enter" || u.key === " ") && (u.preventDefault(), De("kpi-average-weight"));
            },
            style: {
              cursor: "pointer"
            },
            children: [l.jsx("p", {
              className: "kpi-label",
              children: "Peso medio"
            }), l.jsxs("h2", {
              className: "kpi-value",
              children: [r ? Number(r.average_weight_month || 0).toFixed(2) : "-", " ", r ? V === "FDM" ? "g" : "ml" : ""]
            }), l.jsx("span", {
              className: "muted",
              children: "no mes"
            })]
          }), l.jsxs("div", {
            className: "kpi-card kpi-card--warn",
            children: [l.jsx("p", {
              className: "kpi-label",
              children: "Pag. pendentes"
            }), l.jsx("h2", {
              className: "kpi-value",
              children: r ? r.payments_pending : "-"
            }), l.jsx("span", {
              className: "muted",
              children: "em aberto"
            })]
          })]
        }), l.jsxs("section", {
          className: "dashboard-grid",
          children: [l.jsxs("div", {
            className: "chart-panel",
            children: [l.jsxs("div", {
              className: "panel-header",
              children: [l.jsx("h3", {
                children: "Vendas recentes"
              }), l.jsx("span", {
                className: "muted",
                children: "Ultimos 7 dias"
              })]
            }), l.jsx("div", {
              className: "chart-bars",
              children: Zl.map((u, g) => l.jsx("div", {
                className: "chart-bar",
                style: {
                  height: `${Math.max(u, 4)}%`,
                  background: j
                }
              }, g))
            })]
          }), l.jsxs("div", {
            className: "quick-panel",
            children: [l.jsx("div", {
              className: "panel-header",
              children: l.jsx("h3", {
                children: "Alertas"
              })
            }), l.jsxs("ul", {
              className: "alert-list",
              children: [l.jsxs("li", {
                className: `alert-item alert-item--clickable${r && r.low_stock_count > 0 ? " alert-item--warn" : ""}`,
                onClick: () => De("alert-low-stock"),
                children: [l.jsx("span", {
                  className: "alert-icon",
                  children: "\uD83D\uDCE6"
                }), l.jsxs("div", {
                  children: [l.jsx("strong", {
                    children: r ? r.low_stock_count : "-"
                  }), l.jsx("span", {
                    className: "muted",
                    children: " estoque baixo"
                  })]
                })]
              }), l.jsxs("li", {
                className: `alert-item alert-item--clickable${r && r.in_production_count > 0 ? " alert-item--info" : ""}`,
                onClick: () => De("alert-in-production"),
                children: [l.jsx("span", {
                  className: "alert-icon",
                  children: "\u2699\uFE0F"
                }), l.jsxs("div", {
                  children: [l.jsx("strong", {
                    children: r ? r.in_production_count : "-"
                  }), l.jsx("span", {
                    className: "muted",
                    children: " em producao"
                  })]
                })]
              }), l.jsxs("li", {
                className: `alert-item alert-item--clickable${r && r.payments_pending > 0 ? " alert-item--accent" : ""}`,
                onClick: () => De("alert-pending-payments"),
                children: [l.jsx("span", {
                  className: "alert-icon",
                  children: "\uD83D\uDCB0"
                }), l.jsxs("div", {
                  children: [l.jsx("strong", {
                    children: r ? r.payments_pending : "-"
                  }), l.jsx("span", {
                    className: "muted",
                    children: " pag. pendentes"
                  })]
                })]
              })]
            })]
          })]
        }), t && l.jsx(Yf, {
          title: d[t] || "",
          onClose: kt,
          children: aa()
        })]
      })
    })]
  });
}
function Xg(e = []) {
  const t = e.includes("producao-resina"),
    n = e.includes("producao-fdm");
  return e.includes("producao") || t && n ? ["RESINA", "FDM"] : t ? ["RESINA"] : n ? ["FDM"] : [];
}
function Zg(e) {
  const t = String(e || "").trim().toLowerCase();
  return t === "kg" || t === "kilograma" ? "Kilograma" : t === "l" || t === "lt" || t === "litro" ? "Litro" : "Unidade";
}
function mn(e) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(e || 0);
}
function Fn(e) {
  if (!e) return "-";
  const t = String(e).trim(), n = t.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return (n ? new Date(Number(n[1]), Number(n[2]) - 1, Number(n[3])) : new Date(t)).toLocaleDateString("pt-BR");
}
function Is(e) {
  return e ? new Date(e).toLocaleString("pt-BR") : "-";
}
function qo() {
  const e = new Date(), t = e.getFullYear(), n = String(e.getMonth() + 1).padStart(2, "0"), r = String(e.getDate()).padStart(2, "0");
  return `${t}-${n}-${r}`;
}
function Tc(e, t) {
  if (!e || t === "DELIVERED" || t === "CANCELLED") return "sla-green";
  const n = new Date();
  n.setHours(0, 0, 0, 0);
  const s = String(e).trim(), a = s.match(/^(\d{4})-(\d{2})-(\d{2})$/), r = a ? new Date(Number(a[1]), Number(a[2]) - 1, Number(a[3])) : new Date(s);
  r.setHours(0, 0, 0, 0);
  const o = Math.floor((r - n) / 864e5);
  return o <= 1 ? "sla-red" : o <= 2 ? "sla-yellow" : "sla-green";
}
const ev = {
    "sla-red": "Urgente",
    "sla-yellow": "Atencao",
    "sla-green": "No prazo"
  },
  Tr = {
    BUDGET: "Orcamento",
    APPROVED: "A Produzir",
    IN_PRODUCTION: "Produzindo",
    DONE: "Pronto",
    DELIVERED: "Entregue",
    CANCELLED: "Cancelado"
  },
  Ms = {
    PENDING: "Pendente",
    PARTIAL: "Parcial",
    PAID: "Pago",
    REFUNDED: "Estornado"
  },
  $a = {
    PIX: "Pix",
    CARD: "Cartao",
    CASH: "Dinheiro",
    TRANSFER: "Transferencia",
    BOLETO: "Boleto"
  },
  Dc = ["BUDGET", "APPROVED", "IN_PRODUCTION", "DONE", "DELIVERED", "CANCELLED"],
  Ac = ["PENDING", "PARTIAL", "PAID", "REFUNDED"],
  Oc = ["PIX", "CARD", "CASH", "TRANSFER", "BOLETO"],
  Lc = ["Unidade", "Kilograma", "Litro"],
  tv = [{
    key: "orcamento",
    label: "Orcamento",
    statuses: ["BUDGET"]
  }, {
    key: "a-produzir",
    label: "A Produzir",
    statuses: ["APPROVED"]
  }, {
    key: "produzindo",
    label: "Produzindo",
    statuses: ["IN_PRODUCTION"]
  }, {
    key: "pronto",
    label: "Pronto",
    statuses: ["DONE"]
  }, {
    key: "entregue",
    label: "Entregue",
    statuses: ["DELIVERED"]
  }],
  nv = {
    orcamento: "BUDGET",
    "a-produzir": "APPROVED",
    produzindo: "IN_PRODUCTION",
    pronto: "DONE",
    entregue: "DELIVERED"
  },
  bc = {
    customer_id: null,
    customer_name_snapshot: "",
    sale_date: qo(),
    due_date: "",
    status: "BUDGET",
    payment_status: "PENDING",
    payment_method: "",
    notes: "",
    total: "",
    type: "RESINA",
    items: []
  },
  Ic = {
    type: "PF",
    name: "",
    phone: "",
    document: "",
    email: "",
    notes: ""
  },
  Mc = {
    name: "",
    brand: "",
    category: "RAW_MATERIAL",
    type: "RESINA",
    unit: "Unidade",
    min_qty: "",
    current_qty: ""
  },
  Va = {
    senha_atual: "",
    nova_senha: "",
    confirma_senha: ""
  };
function Gg({
  value: e,
  onSelect: t,
  placeholder: n
}) {
  const [r, s] = T.useState(e || ""),
    [a, o] = T.useState([]),
    [i, c] = T.useState(!1),
    f = T.useRef(null),
    h = T.useRef(null);
  T.useEffect(() => {
    s(e || "");
  }, [e]), T.useEffect(() => {
    const E = v => {
      h.current && !h.current.contains(v.target) && c(!1);
    };
    return document.addEventListener("mousedown", E), () => document.removeEventListener("mousedown", E);
  }, []);
  const x = E => {
      const v = E.target.value;
      if (s(v), clearTimeout(f.current), !v.trim()) {
        t(null, v), o([]), c(!1);
        return;
      }
      t(null, v), f.current = setTimeout(async () => {
        try {
          const N = await sr({
            q: v
          });
          o(N.slice(0, 8)), c(!0);
        } catch {
          o([]);
        }
      }, 280);
    },
    w = E => {
      s(E.name), c(!1), o([]), t(E.id, E.name);
    };
  return l.jsxs("div", {
    className: "customer-search",
    ref: h,
    children: [l.jsx("input", {
      type: "text",
      placeholder: n || "Buscar por nome ou CPF/CNPJ",
      value: r,
      onChange: x,
      onFocus: () => a.length > 0 && c(!0),
      autoComplete: "off"
    }), i && a.length > 0 && l.jsx("ul", {
      className: "customer-dropdown",
      children: a.map(E => l.jsxs("li", {
        onMouseDown: () => w(E),
        children: [l.jsx("span", {
          className: "cd-name",
          children: E.name
        }), l.jsx("span", {
          className: "cd-meta",
          children: E.document || E.phone
        })]
      }, E.id))
    })]
  });
}
export default Yg;



