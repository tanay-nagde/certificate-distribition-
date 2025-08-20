import { CertificatePreview } from "@/components/template-editor/certificate-preview"
import { FieldConfigPanel } from "@/components/template-editor/field-config-panel"
import { TemplateEditorHeader } from "@/components/template-editor/template-editor-header"

export default function TemplateEditor() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TemplateEditorHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <div className="flex-1 border-r p-4 md:p-6">
          <CertificatePreview />
        </div>
        <div className="w-full md:w-96 p-4 md:p-6">
          <FieldConfigPanel />
        </div>
      </div>
    </div>
  )
}
