import { AppShell } from "@/components/ui/AppShell"
import { GpsPermissionGate } from "@/features/onboarding/components/GpsPermissionGate"

export default function Page() {
	return (
		<GpsPermissionGate>
			<AppShell />
		</GpsPermissionGate>
	)
}
