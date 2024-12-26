Private Sub Worksheet_Change(ByVal Target As Range)
    On Error Resume Next
    
    ' Проверяем, что изменение произошло в диапазоне C2:C5 и только в одной ячейке
    If Not Intersect(Target, Range("C2:C" & Me.Rows.Count)) Is Nothing And Target.Cells.Count = 1 Then
        Application.EnableEvents = False
        
        Dim newVal As String
        Dim oldVal As String
        Dim valuesArray() As String
        Dim result As String
        Dim temp As Collection
        Dim value As Variant
        Dim i As Integer
        
        ' Получаем новое и старое значения
        newVal = Trim(Target.value)
        Application.Undo
        oldVal = Trim(Target.value)
        
        ' Удаляем квадратные скобки и кавычки из старого значения
        If Len(oldVal) > 0 Then
            oldVal = Replace(Replace(oldVal, "[", ""), "]", "")
            oldVal = Replace(oldVal, Chr(34), "")
        End If
        
        ' Создаем коллекцию для хранения уникальных значений
        Set temp = New Collection
        
        ' Добавляем старые значения в коллекцию
        If Len(oldVal) > 0 Then
            valuesArray = Split(oldVal, ",")
            For i = LBound(valuesArray) To UBound(valuesArray)
                On Error Resume Next
                temp.Add Trim(valuesArray(i)), CStr(Trim(valuesArray(i)))
                On Error GoTo 0
            Next i
        End If
        
        ' Добавляем новое значение, если оно не пустое
        If Len(newVal) > 0 Then
            On Error Resume Next
            temp.Add newVal, CStr(newVal)
            If Err.Number <> 0 Then
                ' Если значение уже существует, удаляем его
                For i = temp.Count To 1 Step -1
                    If temp(i) = newVal Then temp.Remove i
                Next i
            End If
            On Error GoTo 0
        End If
        
        ' Формируем итоговую строку в формате ["Значение1","Значение2"]
        result = "["
        For Each value In temp
            result = result & Chr(34) & value & Chr(34) & ","
        Next value
        If Len(result) > 1 Then result = Left(result, Len(result) - 1) ' Удаляем последнюю запятую
        result = result & "]"
        
        ' Обновляем значение ячейки
        Target.value = result
        
        ' Если новое значение пустое, очищаем ячейку
        If Len(newVal) = 0 Then Target.ClearContents
        
        Application.EnableEvents = True
    End If

    Application.EnableEvents = True
    Exit Sub

ErrorHandler:
    Application.EnableEvents = True
End Sub
