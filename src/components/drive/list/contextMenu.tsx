import { memo, useCallback, useEffect } from "react"
import {
	ContextMenu as CM,
	ContextMenuContent,
	ContextMenuItem,
	ContextMenuTrigger,
	ContextMenuSeparator
} from "@/components/ui/context-menu"
import { useDriveItemsStore } from "@/stores/drive.store"
import useLocation from "@/hooks/useLocation"
import { useTranslation } from "react-i18next"
import { showInputDialog } from "@/components/dialogs/input"
import worker from "@/lib/worker"
import useRouteParent from "@/hooks/useRouteParent"
import eventEmitter from "@/lib/eventEmitter"
import { directoryUUIDToNameCache } from "@/cache"
import useLoadingToast from "@/hooks/useLoadingToast"
import useErrorToast from "@/hooks/useErrorToast"

export const ContextMenu = memo(({ children }: { children: React.ReactNode }) => {
	const { setItems } = useDriveItemsStore()
	const location = useLocation()
	const { t } = useTranslation()
	const parent = useRouteParent()
	const loadingToast = useLoadingToast()
	const errorToast = useErrorToast()

	const createDirectory = useCallback(async () => {
		const inputResponse = await showInputDialog({
			title: t("drive.dialogs.createDirectory.title"),
			continueButtonText: t("drive.dialogs.createDirectory.continue"),
			value: "",
			autoFocusInput: true,
			placeholder: t("drive.dialogs.createDirectory.placeholder")
		})

		if (inputResponse.cancelled) {
			return
		}

		const toast = loadingToast()

		try {
			const item = await worker.createDirectory({ name: inputResponse.value, parent })

			directoryUUIDToNameCache.set(item.uuid, inputResponse.value)

			setItems(prev => [
				...prev.filter(prevItem => prevItem.uuid !== item.uuid && prevItem.name.toLowerCase() !== item.name.toLowerCase()),
				item
			])
		} catch (e) {
			console.error(e)

			errorToast((e as unknown as Error).message ?? (e as unknown as Error).toString())
		} finally {
			toast.dismiss()
		}
	}, [setItems, parent, loadingToast, errorToast, t])

	useEffect(() => {
		const createDirectoryTriggerListener = eventEmitter.on("createFolderTrigger", createDirectory)

		return () => {
			createDirectoryTriggerListener.remove()
		}
	}, [createDirectory])

	if (!location.includes("drive")) {
		return children
	}

	return (
		<CM
			onOpenChange={open => {
				if (open) {
					setItems(prev => prev.map(prevItem => ({ ...prevItem, selected: false })))
				}
			}}
		>
			<ContextMenuTrigger asChild={true}>{children}</ContextMenuTrigger>
			<ContextMenuContent className="min-w-52">
				<ContextMenuItem
					className="cursor-pointer"
					onClick={createDirectory}
				>
					{t("contextMenus.drive.newFolder")}
				</ContextMenuItem>
				<ContextMenuItem
					className="cursor-pointer"
					onClick={() => eventEmitter.emit("createTextFile")}
				>
					{t("contextMenus.drive.newTextFile")}
				</ContextMenuItem>
				<ContextMenuSeparator />
				<ContextMenuItem
					className="cursor-pointer"
					onClick={() => document.getElementById("folder-input")?.click()}
				>
					{t("contextMenus.drive.uploadFolders")}
				</ContextMenuItem>
				<ContextMenuItem
					className="cursor-pointer"
					onClick={() => document.getElementById("file-input")?.click()}
				>
					{t("contextMenus.drive.uploadFiles")}
				</ContextMenuItem>
			</ContextMenuContent>
		</CM>
	)
})

export default ContextMenu
