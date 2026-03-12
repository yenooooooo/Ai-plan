"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown, ChevronUp, Plus, Pencil, Trash2, X,
  FolderInput, MoreHorizontal,
} from "lucide-react";
import type { OrderItem as DBOrderItem, OrderItemGroup } from "@/lib/supabase/types";
import { InlineEditForm } from "./InlineEditForm";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { useUIState } from "@/stores/useUIState";

interface ItemGroupAccordionProps {
  group: OrderItemGroup;
  items: DBOrderItem[];
  allGroups: OrderItemGroup[];
  isFirst: boolean;
  isLast: boolean;
  selectMode: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onAddItem: (groupId: string) => void;
  onSaveItem: (data: {
    item_name: string; unit: string; unit_price: number | null;
    default_order_qty: number; shelf_life_days: number | null;
    supplier_name: string | null; supplier_contact: string | null; group_id: string;
  }) => void;
  onDeleteItem: (itemId: string) => void;
  onToggleItem: (itemId: string, isActive: boolean) => void;
  onRenameGroup: (groupId: string, name: string) => Promise<boolean>;
  onDeleteGroup: (groupId: string) => Promise<boolean>;
  onReorderGroup: (groupId: string, dir: "up" | "down") => void;
  onMoveItem: (itemId: string, targetGroupId: string) => void;
  editingItemId: string | null;
  onSetEditingItemId: (id: string | null) => void;
  readOnly?: boolean;
}

export function ItemGroupAccordion({
  group, items, allGroups, isFirst, isLast,
  selectMode, selectedIds, onToggleSelect,
  onAddItem, onSaveItem, onDeleteItem, onToggleItem,
  onRenameGroup, onDeleteGroup, onReorderGroup, onMoveItem,
  editingItemId, onSetEditingItemId,
  readOnly = false,
}: ItemGroupAccordionProps) {
  const itemGroupsOpen = useUIState((s) => s.orderItemGroups);
  const setItemGroupOpen = useUIState((s) => s.setOrderItemGroup);
  const open = itemGroupsOpen[group.id] ?? true;
  const setOpen = (v: boolean) => setItemGroupOpen(group.id, v);
  const [menuOpen, setMenuOpen] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameName, setRenameName] = useState(group.group_name);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ type: "group" | "item"; id: string; name: string } | null>(null);
  const activeCount = items.filter((i) => i.is_active).length;

  const handleRename = async () => {
    if (!renameName.trim() || renameName.trim() === group.group_name) { setRenaming(false); return; }
    const ok = await onRenameGroup(group.id, renameName);
    if (ok) setRenaming(false);
  };

  const handleConfirmAction = async () => {
    if (!confirmDelete) return;
    if (confirmDelete.type === "group") await onDeleteGroup(confirmDelete.id);
    else onDeleteItem(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="glass-card overflow-hidden">
      {/* 헤더 */}
      <div className="flex items-center justify-between p-4">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 flex-1 min-w-0 press-effect">
          <span className="text-lg">{group.icon ?? "📦"}</span>
          {renaming ? (
            <input autoFocus type="text" value={renameName}
              onChange={(e) => setRenameName(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleRename(); if (e.key === "Escape") setRenaming(false); }}
              onBlur={handleRename} onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-[var(--bg-tertiary)] rounded-lg px-2 py-1 text-body-small text-[var(--text-primary)] outline-none border border-primary-500" />
          ) : (
            <span className="text-body-small font-semibold text-[var(--text-primary)]">{group.group_name}</span>
          )}
          <span className="text-caption text-[var(--text-tertiary)]">{activeCount}개</span>
        </button>

        <div className="flex items-center gap-0.5">
          {!readOnly && !isFirst && (
            <button onClick={() => onReorderGroup(group.id, "up")} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
              <ChevronUp size={14} />
            </button>
          )}
          {!readOnly && !isLast && (
            <button onClick={() => onReorderGroup(group.id, "down")} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
              <ChevronDown size={14} />
            </button>
          )}

          {!readOnly && (
            <div className="relative">
              <button onClick={() => setMenuOpen(!menuOpen)} className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 top-8 z-20 w-36 glass-card shadow-lg border border-[var(--border-subtle)] p-1 rounded-xl">
                    <button onClick={() => { setRenaming(true); setRenameName(group.group_name); setMenuOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-small text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                      <Pencil size={13} />이름 변경
                    </button>
                    <button onClick={() => { setMenuOpen(false); setConfirmDelete({ type: "group", id: group.id, name: group.group_name }); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-small text-danger hover:bg-danger/5">
                      <Trash2 size={13} />카테고리 삭제
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <button onClick={() => setOpen(!open)} className="p-1.5">
              <ChevronDown size={18} className="text-[var(--text-tertiary)]" />
            </button>
          </motion.div>
        </div>
      </div>

      {/* 품목 리스트 */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="px-4 pb-3 space-y-1">
              {items.map((item) => (
                <div key={item.id}>
                  <div className={`flex items-center justify-between py-2 px-2 rounded-lg transition-colors ${
                    editingItemId === item.id ? "bg-[var(--bg-tertiary)]" : "hover:bg-[var(--bg-tertiary)]"
                  }`}>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {selectMode ? (
                        <button onClick={() => onToggleSelect(item.id)}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            selectedIds.has(item.id) ? "bg-primary-500 border-primary-500" : "border-[var(--border-default)]"
                          }`}>
                          {selectedIds.has(item.id) && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      ) : (
                        <button onClick={() => onToggleItem(item.id, !item.is_active)} disabled={readOnly}
                          className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                            item.is_active ? "bg-primary-500 border-primary-500" : "border-[var(--border-default)]"
                          }`}>
                          {item.is_active && (
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 6L5 9L10 3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </button>
                      )}
                      <div className="min-w-0">
                        <span className={`text-body-small ${item.is_active ? "text-[var(--text-primary)]" : "text-[var(--text-tertiary)] line-through"}`}>
                          {item.item_name}
                        </span>
                        <span className="text-caption text-[var(--text-tertiary)] ml-2">
                          {item.unit}{item.unit_price ? ` · ₩${item.unit_price.toLocaleString()}` : ""}
                        </span>
                      </div>
                    </div>

                    {!selectMode && !readOnly && (
                      <div className="flex items-center gap-0.5">
                        {allGroups.length > 1 && (
                          <div className="relative">
                            <button onClick={() => setMovingItemId(movingItemId === item.id ? null : item.id)}
                              className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]">
                              <FolderInput size={13} />
                            </button>
                            {movingItemId === item.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setMovingItemId(null)} />
                                <div className="absolute right-0 top-8 z-20 w-40 glass-card shadow-lg border border-[var(--border-subtle)] p-1 rounded-xl">
                                  <p className="px-3 py-1.5 text-[11px] text-[var(--text-tertiary)]">이동할 카테고리</p>
                                  {allGroups.filter((g) => g.id !== group.id).map((g) => (
                                    <button key={g.id} onClick={() => { onMoveItem(item.id, g.id); setMovingItemId(null); }}
                                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-body-small text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]">
                                      <span className="text-sm">{g.icon ?? "📦"}</span>{g.group_name}
                                    </button>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        )}
                        <button onClick={() => onSetEditingItemId(editingItemId === item.id ? null : item.id)}
                          className={`p-1.5 rounded-md transition-colors ${editingItemId === item.id ? "text-primary-500" : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]"}`}>
                          {editingItemId === item.id ? <X size={14} /> : <Pencil size={14} />}
                        </button>
                        <button onClick={() => setConfirmDelete({ type: "item", id: item.id, name: item.item_name })}
                          className="p-1.5 rounded-md text-[var(--text-tertiary)] hover:text-danger transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  <AnimatePresence>
                    {editingItemId === item.id && (
                      <InlineEditForm item={item} groupId={item.group_id ?? group.id}
                        onSave={(data) => { onSaveItem(data); onSetEditingItemId(null); }}
                        onCancel={() => onSetEditingItemId(null)} />
                    )}
                  </AnimatePresence>
                </div>
              ))}

              {!readOnly && (
                <button onClick={() => onAddItem(group.id)}
                  className="flex items-center gap-2 w-full py-2 px-2 rounded-lg text-primary-500 hover:bg-primary-500/5 transition-colors">
                  <Plus size={16} /><span className="text-body-small">품목 추가</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 삭제 확인 다이얼로그 */}
      <ConfirmDialog
        open={!!confirmDelete}
        title={confirmDelete?.type === "group" ? "카테고리 삭제" : "품목 삭제"}
        message={confirmDelete?.type === "group"
          ? `"${confirmDelete?.name}" 카테고리와 모든 품목이 삭제됩니다.`
          : `"${confirmDelete?.name}" 품목을 삭제하시겠습니까?`}
        confirmLabel="삭제" danger
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmDelete(null)}
      />
    </div>
  );
}
