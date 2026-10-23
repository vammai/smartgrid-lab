/* Mẫu nhận diện thông số trong datasheet (Anh / Pháp). Chỉ dùng để ĐỀ XUẤT ứng viên kèm số trang;
   người dùng phải chọn và xác nhận. Dòng không khớp mẫu → để trống, không đoán. */
SG.EXTRACT = {
  pv: [
    ['Pmod', /(maximum power|rated (maximum )?power|nominal power|p\s?max|puissance (maximale|nominale|cr[eê]te))/i, 'W'],
    ['Voc', /(open[- ]?circuit voltage|\bvoc\b|u\s?oc|tension (de |à |en )?circuit ouvert)/i, 'V'],
    ['Vmp', /(maximum power voltage|voltage at (maximum|max\.?) power|\bv\s?mpp?\b|u\s?mpp?|tension (au|à la|à) (point de )?puissance max)/i, 'V'],
    ['Isc', /(short[- ]?circuit current|\bisc\b|i\s?sc|courant de court[- ]circuit)/i, 'A'],
    ['Imp', /(maximum power current|current at (maximum|max\.?) power|\bi\s?mpp?\b|courant (au|à la|à) (point de )?puissance max)/i, 'A'],
    ['bVoc', /(temp(erature)?\.? coeff(icient)?\.?.{0,12}(voc|uoc|open)|coefficient de temp[ée]rature.{0,20}(voc|uoc|tension))/i, '%/°C'],
    ['bPmax', /(temp(erature)?\.? coeff(icient)?\.?.{0,12}(p\s?max|power)|coefficient de temp[ée]rature.{0,20}(pmax|puissance))/i, '%/°C']
  ],
  bat: [
    ['Vnom', /(nominal voltage|rated voltage|tension nominale)/i, 'V'],
    ['Vmin', /(min(imum)?\.? (operating |discharge )?voltage|voltage range|plage de tension|tension min)/i, 'V'],
    ['Vmax', /(max(imum)?\.? (operating |charge |charging )?voltage|voltage range|plage de tension|tension max)/i, 'V'],
    ['E', /(usable energy|nominal energy|capacity|capacit[ée]|[ée]nergie (utile|nominale))/i, 'kWh'],
    ['Ich', /(max(imum)?\.? (continuous )?charg(e|ing) current|courant (max(imal)? )?de charge)/i, 'A'],
    ['Idis', /(max(imum)?\.? (continuous )?discharg(e|ing) current|courant (max(imal)? )?de d[ée]charge)/i, 'A'],
    ['proto', /(communication|interface|protocol)/i, 'text']
  ],
  motor: [
    ['P', /(rated (output )?power|nominal power|puissance (nominale|utile|assign[ée]e))/i, 'kW'],
    ['U', /(rated voltage|nominal voltage|tension (nominale|assign[ée]e))/i, 'V'],
    ['In', /(rated current|nominal current|courant (nominal|assign[ée]))/i, 'A'],
    ['cos', /(power factor|cos\s?(φ|phi|ϕ)|facteur de puissance)/i, ''],
    ['eta', /(efficiency|rendement)/i, '%'],
    ['rpm', /(rated speed|nominal speed|vitesse (nominale|assign[ée]e)|r\/?min|tr\/min|min-1)/i, 'vg/ph']
  ]
};
